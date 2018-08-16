/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const WamsShared = require('./shared.js');
const { Blueprint } = require('canvas-sequencer');

/*
 * Shorthand for the shared set of constants between server and client.
 */
const globals = Object.freeze(WamsShared.constants);

/*
 * The ServerItem provides operations for the server to locate and move items
 * around.
 */
const ServerItem = (function defineServerItem() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      x: 0,
      y: 0,
      width: 128,
      height: 128,
      type: 'view/background',
      imgsrc: '',
      blueprint: null,
    }),
    STAMPER: new WamsShared.IDStamper(),
  });

  class ServerItem extends WamsShared.Item {
    constructor(values = {}) {
      super(WamsShared.getInitialValues(locals.DEFAULTS, values));
      locals.STAMPER.stampNewId(this);
    }

    containsPoint(x,y) {
      return  (this.x <= x) && 
        (this.y <= y) && 
        (this.x + this.width  >= x) && 
        (this.y + this.height >= y);
    }

    /*
     * Items are allowed to be moved off screen, so no limitations on where
     * items can be moved to.
     */
    moveTo(x = this.x, y = this.y) {
      this.assign({x,y});
    }

    moveBy(dx = 0, dy = 0) {
      this.moveTo(this.x + dx, this.y + dy);
    }
  }

  return ServerItem;
})();

/*
 * The ServerView provides operations for the server to locate, move,
 * and rescale views.
 */
const ServerView = (function defineServerView() {
  const locals = Object.freeze({
    DEFAULTS: {
      x: 0,
      y: 0,
      width: 1600,
      height: 900,
      type: 'view/background',
      scale: 1,
      rotation: 0,
      bounds: {
        x: 10000,
        y: 10000,
      },
    },
    STAMPER: new WamsShared.IDStamper(),
  });

  class ServerView extends WamsShared.View {
    /*
     * XXX: At some point, the effective width and height should be made to be
     *      updated whenever either the width, height, or scale of the
     *      view get updated. This could be achieve with getters and 
     *      setters on those three values. Might need to think through all the
     *      possible complications though.
     *
     *      The same thing could maybe be done with the 'center' getter, so
     *      that it refers to an actual stored value that gets updated whenever
     *      the effective width or height gets updated, or when the x or y
     *      values get updated. This would prevent having to recompute every
     *      time the value is accessed, which is the way things are working
     *      currently.
     *
     *      Perhaps one technique would be to find a way of storing the actual
     *      x, y, width, height, effectiveWidth, effectiveHeight, and scale
     *      using some private data technique with alternative names for the
     *      variables (or some other storage method) and have the original 
     *      names be used for the getters and setters. Might want to have a
     *      look at the shared Reporter factory definition to see if this can
     *      be handled at a more general level.
     */
    constructor(values = {}) {
      super(WamsShared.getInitialValues(locals.DEFAULTS, values));
      this.bounds = values.bounds || locals.DEFAULTS.bounds;
      this.effectiveWidth = this.width / this.scale;
      this.effectiveHeight = this.height / this.scale;
      locals.STAMPER.stampNewId(this);
    }

    get bottom()  { return this.y + this.effectiveHeight; }
    get left()    { return this.x; }
    get right()   { return this.x + this.effectiveWidth; }
    get top()     { return this.y; }

    canBeScaledTo(width = this.width, height = this.height) {
      return  (width  > 0) &&
        (height > 0) &&
        (this.x + width  <= this.bounds.x) &&
        (this.y + height <= this.bounds.y);
    }

    /*
     * The canMoveTo[XY] functions are split up in order to allow for the x and
     * y dimensions to be independently moved. In other words, if a move fails
     * in the x direction, it can still succeed in the y direction. This makes
     * it easier to push the view into the boundaries.
     *
     * XXX: Can they be unified simply while still allowing this kind of 
     *      separation?
     */
    canMoveToX(x = this.x) {
      return (x >= 0) && (x + this.effectiveWidth <= this.bounds.x);
    }

    canMoveToY(y = this.y) {
      return (y >= 0) && (y + this.effectiveHeight <= this.bounds.y);
    }

    refineMouseCoordinates(x, y, dx, dy) {
      const data = { x, y, dx, dy };
      /*
       * WARNING: It is crucially important that the instructions below occur
       * in *precisely* this order!
       */
      applyScale(data, this.scale);
      applyRotation(data, (2 * Math.PI) - this.rotation);
      applyTranslation(data, this.x, this.y);
      return data;

      function applyScale(data, scale) {
        data.x /= scale;
        data.y /= scale;
        data.dx /= scale;
        data.dy /= scale;
      }

      function applyTranslation(data, x, y) {
        data.x += x;
        data.y += y;
      }

      function applyRotation(data, theta) {
        const cos_theta = Math.cos(theta);
        const sin_theta = Math.sin(theta);
        const x = data.x;
        const y = data.y;
        const dx = data.dx;
        const dy = data.dy;

        data.x = rotateX(x, y, cos_theta, sin_theta);
        data.y = rotateY(x, y, cos_theta, sin_theta);
        data.dx = rotateX(dx, dy, cos_theta, sin_theta);
        data.dy = rotateY(dx, dy, cos_theta, sin_theta);

        function rotateX(x, y, cos_theta, sin_theta) {
          return x * cos_theta - y * sin_theta;
        }

        function rotateY(x, y, cos_theta, sin_theta) {
          return x * sin_theta + y * cos_theta;
        }
      }
    }

    /*
     * Views are constrained to stay within the boundaries of the workspace.
     */
    moveTo(x = this.x, y = this.y) {
      const coordinates = { x: this.x, y: this.y };
      if (this.canMoveToX(x)) coordinates.x = x;
      if (this.canMoveToY(y)) coordinates.y = y;
      this.assign(coordinates);
    }

    moveBy(dx = 0, dy = 0) {
      this.moveTo(this.x + dx, this.y + dy);
    }

    /*
     * The scaled width and height (stored permanently as effective width and
     * height) are determined by dividing the width or height by the scale.
     * This might seem odd at first, as that seems to be the opposite of what
     * should be done. But what these variables are actually representing is the
     * amount of the underlying workspace that can be displayed inside the
     * view. So a larger scale means that each portion of the workspace takes
     * up more of the view, therefore _less_ of the workspace is visible.
     * Hence, division.
     *
     * XXX: One thing that could be done in this function is to try anchoring
     *      on the right / bottom if anchoring on the left / top produces a
     *      failure. (By anchoring, I mean that the given position remains
     *      constant while the scaling is occurring).
     */
    rescale(scale = this.scale) {
      const effectiveWidth = this.width / scale;
      const effectiveHeight = this.height / scale;
      if (this.canBeScaledTo(effectiveWidth, effectiveHeight)) {
        this.assign({ scale, effectiveWidth, effectiveHeight });
        return true;
      }
      return false;
    }
  }

  return ServerView;
})();

/*
 * Treat this factory as a static class with no constructor. If you try to
 * instantiate it with the 'new' keyword you will get an exception. Its primary
 * usage is for generating appropriate listeners via its 'build' function.
 */
const ListenerFactory = (function defineListenerFactory() {
  const locals = Object.freeze({
    BLUEPRINTS: Object.freeze({
      click(listener, workspace) {
        return function handleClick(view, {x, y}) {
          const mouse = view.refineMouseCoordinates(x, y);
          if (mouse) {
            const {x, y} = mouse;
            const target = workspace.findItemByCoordinates(x, y) || view;
            listener(view, target, x, y);
          }
        };
      },

      drag(listener, workspace) {
        return function handleDrag(view, {x, y, dx, dy}) {
          const mouse = view.refineMouseCoordinates(x, y, dx, dy);
          if (mouse) {
            const {x, y, dx, dy} = mouse;
            const target = workspace.findItemByCoordinates(x,y) || view;
            listener(view, target, x, y, dx, dy);
          }
        };
      },

      layout(listener, workspace) {
        return function handleLayout(view, data) {
          listener(view, workspace.views.length);
        };
      },

      rotate(listener, workspace) {
        return function handleRotate(view, {radians}) {
          listener(view, radians);
        };
      },

      scale(listener, workspace) {
        return function handleScale(view, {scale}) {
          listener(view, scale);
        };
      },
    }),
  });

  const ListenerFactory = Object.freeze({
    build(type, listener, workspace) {
      if (typeof listener !== 'function') {
        throw 'Attached listener must be a function';
      } 
      return locals.BLUEPRINTS[type](listener, workspace);
    },
    TYPES: Object.keys(locals.BLUEPRINTS),
  });

  return ListenerFactory;
})();

/*
 * The WorkSpace keeps track of views and items, and can handle events on
 * those items and views which allow them to be interacted with.
 */
const WorkSpace = (function defineWorkSpace() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      bounds: {
        x: 10000,
        y: 10000,
      },
      color: '#aaaaaa',
    }),
    MIN_BOUND: 100,
    STAMPER: new WamsShared.IDStamper(),

    resolveBounds(bounds = {}) {
      function safeNumber(x) {
        return Number(x) || 0; // Prevents NaN from falling through.
      }
      const x = safeNumber(bounds.x);
      const y = safeNumber(bounds.y);
      if (x < locals.MIN_BOUND || y < locals.MIN_BOUND) {
        throw `Invalid bounds received: ${bounds}`;
      }
      return {x,y};
    }
  });

  class WorkSpace {
    constructor(settings) {
      this.settings = WamsShared.getInitialValues(locals.DEFAULTS, settings);
      this.settings.bounds = locals.resolveBounds(this.settings.bounds);
      locals.STAMPER.stampNewId(this);

      // Things to track.
      // this.subWS = [];
      this.views = [];
      this.items = [];

      // Attach NOPs for the event listeners, so they are callable.
      this.handlers = {};
      ListenerFactory.TYPES.forEach( ev => {
        this.handlers[ev] = WamsShared.NOP;
      });
    }

    get width()  { return this.settings.bounds.x; }
    get height() { return this.settings.bounds.y; }
    set width(width)   { this.settings.bounds.x = width;  }
    set height(height) { this.settings.bounds.y = height; }

    // addSubWS(subWS) {
    //   this.subWS.push(subWS);
    //   //TODO: add check to make sure subWS is in bounds of the main workspace
    //   //TODO: probably send a workspace update message
    // }

    findItemByCoordinates(x,y) {
      return this.items.find( o => o.containsPoint(x,y) );
    }

    handle(message, ...args) {
      return this.handlers[message](...args);
    }

    on(event, listener) {
      const type = event.toLowerCase();
      this.handlers[type] = ListenerFactory.build(type, listener, this);
    }

    removeView(view) {
      return WamsShared.removeByID( this.views, view, ServerView );
    }

    removeItem(item) {
      return WamsShared.removeByID( this.items, item, ServerItem );
    }

    reportViews() {
      return this.views.map( v => v.report() );
    }

    reportItems() {
      return this.items.map( o => o.report() );
    }

    spawnView(values = {}) {
      values.bounds = this.settings.bounds;
      const v = new ServerView(values);
      this.views.push(v);
      return v;
    }

    spawnItem(values = {}) {
      const o = new ServerItem(values);
      this.items.push(o);
      return o;
    }
  }

  return WorkSpace;
})();

/*
 * A Connection maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client, as well as the 
 * associated workspace.
 */
const Connection = (function defineConnection() {
  const Message = WamsShared.Message;
  const symbols = Object.freeze({
    attach_listeners: Symbol(),
  });

  class Connection {
    constructor(socket, workspace) {
      this.socket = socket;
      this.workspace = workspace;
      this.view = this.workspace.spawnView();
      this[symbols.attach_listeners]();

      const fsreport = new WamsShared.FullStateReporter({
        views: this.workspace.reportViews(),
        items: this.workspace.reportItems(),
        color: this.workspace.settings.color,
        id: this.view.id,
      });
      new Message(Message.INITIALIZE, fsreport).emitWith(this.socket);
    }

    [symbols.attach_listeners]() {
      const listeners = {
        // For the server to inform about changes to the model
        [Message.ADD_ITEM]:   WamsShared.NOP,
        [Message.ADD_SHADOW]: WamsShared.NOP,
        [Message.RM_ITEM]:    WamsShared.NOP,
        [Message.RM_SHADOW]:  WamsShared.NOP,
        [Message.UD_ITEM]:    WamsShared.NOP,
        [Message.UD_SHADOW]:  WamsShared.NOP,
        [Message.UD_VIEW]:  WamsShared.NOP,

        // Connection establishment related (disconnect, initial setup)
        [Message.INITIALIZE]: WamsShared.NOP,
        [Message.LAYOUT]:     (...args) => this.layout(...args),

        // User event related
        [Message.CLICK]:  (...args) => this.handle('click', ...args),
        [Message.DRAG]:   (...args) => this.handle('drag', ...args),
        [Message.RESIZE]: (...args) => this.resize(...args),
        [Message.ROTATE]: (...args) => this.handle('rotate', ...args),
        [Message.SCALE]:  (...args) => this.handle('scale', ...args),
      };

      Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
    }

    disconnect() {
      if (this.workspace.removeView(this.view)) {
        this.socket.disconnect(true);
        console.log(
          'view', this.view.id, 
          'disconnected from workspace', this.workspace.id
        );
        return true;
      } 
      return false;
    }

    handle(message, ...args) {
      this.workspace.handle(message, this.view, ...args);
    }

    layout(data) {
      this.view.assign(data);
      new Message(Message.ADD_SHADOW, this.view)
        .emitWith(this.socket.broadcast);
      this.workspace.handle('layout', this.view, data);
    }

    resize(data) {
      this.view.assign(data);
    }
  }

  return Connection;
})();

/*
 * XXX: The paths being used in the request handler are a little hacky and all
 *      over the place right now. Look into how to normalize them.
 */
const RequestHandler = (function defineRequestHandler() {
  const path = require('path');
  const express = require('express');

  function establishMainRoutes(app) {
    const view   = path.join(__dirname, '../src/view.html');
    const shared = path.join(__dirname, '../src/shared.js');
    const client = path.join(__dirname, '../src/client.js');
    app.get('/',          (req, res) => res.sendFile(view)    );
    app.get('/shared.js', (req, res) => res.sendFile(shared)  );
    app.get('/client.js', (req, res) => res.sendFile(client)  );
  }

  function establishAuxiliaryRoutes(app) {
    /* 
     * XXX: express.static() generates a middleware function for 
     *    serving static assets from the directory specified.
     *    - The order in which these functions are registered with
     *      this.app.use() is important! The callbacks will be triggered
     *      in this order!
     *    - When app.use() is called without a 'path' argument it uses the
     *      default '/' argument, with the result that these callbacks will be
     *      executed for _every_ request to the app! This is why we specify the
     *      path!!
     *    - Should also consider specifying options. Possibly useful:
     *      + immutable
     *      + maxAge
     */
    const images = path.join(__dirname, '../img');
    const libs = path.join(__dirname, '../libs');
    app.use('/img', express.static(images));
    app.use('/libs', express.static(libs));
  }

  class RequestHandler {
    constructor() {
      const app = express();
      establishMainRoutes(app);
      establishAuxiliaryRoutes(app);
      return app;
    }
  }

  return RequestHandler;
})();

/*
 * A WamsServer handles the core server operations of a Wams program,
 * including server establishment, and establishing Connections when new
 * clients connect to the server, as well as tracking the workspace
 * associated with the server so that Connections can be linked to the 
 * workspace.
 */
const WamsServer = (function defineWamsServer() {
  const http = require('http');
  const IO = require('socket.io');
  const os = require('os');
  const Message = WamsShared.Message;

  const locals = Object.freeze({
    DEFAULTS: {
      clientLimit: 10,
    },
    PORT: 9000,
    getLocalIP() {
      let ipaddr = null;
      Object.values(os.networkInterfaces()).some( f => {
        return f.some( a => {
          if (a.family === 'IPv4' && a.internal === false) {
            ipaddr = a.address;
            return true;
          }
          return false;
        });
      });
      return ipaddr;
    },
  });

  const symbols = Object.freeze({
    clientlimit: Symbol('clientLimit'),
    connect: Symbol('connect'),
    disconnect: Symbol('disconnect'),
    io: Symbol('io'),
    server: Symbol('server'),
    workspace: Symbol('workspace'),
  });

  class WamsServer {
    constructor(settings = {}) {
      this[symbols.clientLimit] = settings.clientLimit || 
        locals.DEFAULTS.clientLimit;
      this[symbols.workspace] = new WorkSpace(settings);
      this[symbols.server] = http.createServer(new RequestHandler());
      this[symbols.io] = IO(this[symbols.server]);
      this[symbols.io].of(globals.NS_WAMS)
        .on('connect', this[symbols.connect].bind(this));

      /*
       * FIXME: Not necessary to actually track connections like this, doing it
       *      for debugging assistance, for now.
       * XXX: Actuallly, I am using them right now, in updateView().
       */
      this.connections = [];
    }

    [symbols.connect](socket) {
      this[symbols.io].of(globals.NS_WAMS).clients((error, clients) => {
        if (error) throw error;
        if (clients.length <= this[symbols.clientLimit]) {
          const c = new Connection(socket, this[symbols.workspace]);
          this.connections.push(c);
          socket.on('disconnect', () => this[symbols.disconnect](c) );

          console.log(
            `View ${c.view.id} connected to workspace listening on port`,
            this[symbols.server].address().port
          );
        } else {
          socket.emit('wams-full');
          socket.disconnect(true);
          // TODO: Report disconnection to client, server.
        }
      });
    }

    [symbols.disconnect](cn) {
      if (cn.disconnect()) {
        this.connections.splice(this.connections.indexOf(cn), 1);
        new Message(Message.RM_SHADOW, cn.view)
          .emitWith(this[symbols.io].of(globals.NS_WAMS));
      } else {
        console.error('Failed to disconnect:', this);
      }
    }

    /*
     * For modularity, may want to refactor this to allow the user to have more
     * control over server establishment.
     */
    listen(port = locals.PORT, host = locals.getLocalIP()) {
      this[symbols.server].listen(port, host, () => {
        console.log('Listening on', this[symbols.server].address());
      });
    }

    on(event, handler) {
      this[symbols.workspace].on(event, handler);
    }

    removeItem(item) {
      if (this[symbols.workspace].removeItem(item)) {
        new Message(Message.RM_ITEM, item)
          .emitWith(this[symbols.io].of(globals.NS_WAMS));
      }
    }

    spawnItem(itemdata) {
      const item = this[symbols.workspace].spawnItem(itemdata);
      new Message(Message.ADD_ITEM, item)
        .emitWith(this[symbols.io].of(globals.NS_WAMS));
      return item;
    }

    update(object, data) {
      if (object instanceof ServerItem) {
        this.updateItem(object, data);
      } else if (object instanceof ServerView) {
        this.updateView(object, data);
      }
    }

    /*
     * TODO: Improve the functionality, to make use of the functions in the
     * ServerItem and ServerView classes.
     */
    updateItem(item, data) {
      item.assign(data);
      new Message(Message.UD_ITEM, item)
        .emitWith(this[symbols.io].of(globals.NS_WAMS));
    }

    updateView(view, data) {
      view.assign(data);
      const connection = this.connections.find( c => {
        return c.view.id === view.id;
      });
      if (connection) {
        new Message(Message.UD_SHADOW, view)
          .emitWith(connection.socket.broadcast);
        new Message(Message.UD_VIEW, view)
          .emitWith(connection.socket);
      } else {
        console.warn('Failed to locate connection');
      }
    }
  }

  return WamsServer;
})();

exports.ServerItem = ServerItem;
exports.ServerView = ServerView;
exports.ListenerFactory = ListenerFactory;
exports.WorkSpace = WorkSpace;
exports.Connection = Connection;
exports.RequestHandler = RequestHandler;
exports.WamsServer = WamsServer;
exports.Sequence = Blueprint;

exports.Item = ServerItem;

