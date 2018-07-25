/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Original author: Jesse Rolheiser
 * Revised by: Scott Bateman
 * Latest edition by: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

//TODO: Update canvas to work more like this for drawings: 
// https://simonsarris.com/making-html5-canvas-useful/
//TODO: Stretch goal is to incorporate a canvas library: 
// http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/
//TODO: Allow subcanvas to be drawn on top: 
// https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers

'use strict';

/*
 * XXX: BUG! Disconnects aren't actually disconnecting!!!
 */

/*
 * XXX: Look into socket.io 'rooms', as they look like the kind of thing that
 *    might make some of this work a lot easier.
 */
const WamsShared = require('./shared.js');

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
      drawCustom: '',
      drawStart: '',
    }),
    STAMPER: new WamsShared.IDStamper(),
  });

  class ServerItem extends WamsShared.Item {
    /*
     * XXX: What is the item supposed to be if the draw strings are not 
     *      defined?
     *
     * IDEA: Instead of using strings of code and running 'eval()' on them to
     *      get custom renderings in the canvas, write a 'CanvasSequencer'
     *      class which can pass queues of canvas operations around, checking
     *      their legitimacy, then will run those operations on the canvas
     *      context.
     *      + This eliminates the arbitrary code problem, and allows us to
     *        write an API for this behaviour through which we can exercise
     *        some control over what is done with our WAMS API.
     *      + For example, a sequence could look like:
     *        
     *          const seq = [
     *            ['beginPath', []],
     *            ['arc', [64, 164, 100, 2 * Math.PI, false]],
     *            ['fillStyle', 'white'],
     *            ['fill', []],
     *            ['lineWidth', 5],
     *            ['strokeStyle', '#003300'],
     *            ['stroke', []],
     *            ['font', 'normal 36px Verdana'],
     *            ['fillStyle', '#000000'],
     *            ['fillText', ['HTML5 Canvas Text', 132, 182]],
     *          ];
     *
     *      + This sequence could be exucuted in the client as follows (assume
     *        a CanvasRenderingContext2D is stored in ctx):
     *        
     *          seq.forEach( ([p,v]) => {
     *            if (v instanceof Array) {
     *              ctx[p].apply(ctx, v);
     *            } else {
     *              ctx[p] = v;
     *            }
     *          });
     *
     *      + The above example is rudimentary, but showcases the fundamental
     *        idea. The 'seq' array can easily be passed between server and
     *        client.
     */
    constructor(values = {}) {
      super(WamsShared.initialize(locals.DEFAULTS, values));
      locals.STAMPER.stamp(this);
    }

    containsPoint(x,y) {
      return  (this.x <= x) && 
        (this.y <= y) && 
        (this.x + this.width  >= x) && 
        (this.y + this.height >= y);
    }

    /*
     * Items are allowed to be moved off screen, so limitations on where
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
 * The ServerViewer provides operations for the server to locate, move,
 * and rescale viewers.
 */
const ServerViewer = (function defineServerViewer() {
  const locals = Object.freeze({
    DEFAULTS: {
      x: 0,
      y: 0,
      width: 1600,
      height: 900,
      type: 'view/background',
      scale: 1,
      rotation: 0,
    },
    MIN_DIMENSION: 100,
    STAMPER: new WamsShared.IDStamper(),

    resolveBounds(bounds = {}) {
      function safeNumber(x) {
        return Number(x) || 0; // Prevents NaN from falling through.
      }
      const x = safeNumber(bounds.x);
      const y = safeNumber(bounds.y);
      if (x < 100 || y < 100) throw 'Invalid bounds received';
      return {x,y};
    }
  });

  class ServerViewer extends WamsShared.Viewer {
    /*
     * XXX: At some point, the effective width and height should be made to be
     *      updated whenever either the width, height, or scale of the
     *      viewer get updated. This could be achieve with getters and 
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
    constructor(bounds, values) {
      super(WamsShared.initialize(locals.DEFAULTS, values));
      this.bounds = locals.resolveBounds(bounds);
      this.effectiveWidth = this.width / this.scale;
      this.effectiveHeight = this.height / this.scale;
      locals.STAMPER.stamp(this);
    }

    get bottom()  { return this.y + this.effectiveHeight; }
    get left()    { return this.x; }
    get right()   { return this.x + this.effectiveWidth; }
    get top()     { return this.y; }

    /*
     * The center() getter returns an object that exposes x and y getters which
     * will always return the _current_ (at the moment the getter is called)
     * center of the viewer along that dimension.
     */
    get center()  {
      return ((viewer) => {
        return Object.freeze({
          get x() { return viewer.x + (viewer.effectiveWidth  / 2); },
          get y() { return viewer.y + (viewer.effectiveHeight / 2); },
        });
      })(this);
    }

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
     * it easier to push the viewer into the boundaries.
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

    /*
     * Viewers are constrained to stay within the boundaries of the
     * workspace, to protect the render. To ensure this safety, extra
     * potentially redundant checks and fallbacks are used in this function.
     */
    moveTo(x = this.x, y = this.y) {
      const coordinates = {
        x: this.x, 
        y: this.y
      };
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
     * should be done. But what these variables are actually representing is 
     * the amount of the underlying workspace that can be displayed inside the
     * viewer. So a larger scale means that each portion of the workspace
     * takes up more of the viewer, therefore _less_ of the workspace is
     * visible. Hence, division.
     *
     * XXX: One thing that could be done in this function is to try anchoring
     *      on the right / bottom if anchoring on the left / top produces a
     *      failure. (By anchoring, I mean that the given position remains
     *      constant while the scaling is occurring).
     */
    rescale(scale = this.scale) {
      const scaledWidth = this.width / scale;
      const scaledHeight = this.height / scale;
      if (this.canBeScaledTo(scaledWidth, scaledHeight)) {
        this.assign({
          scale: scale,
          effectiveWidth: scaledWidth,
          effectiveHeight: scaledHeight,
        });
        return true;
      }
      return false;
    }
  }

  return ServerViewer;
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
        return function handleClick(viewer, x, y) {
          const target = workspace.findItemByCoordinates(x,y) || workspace;
          listener(viewer, target, x, y);
        };
      },

      drag(listener, workspace) {
        return function handleDrag(viewer, x, y, dx, dy) {
          /*
           * XXX: This is causing jitter. Will have to look in the 
           *    debugger, perhaps multiple events are firing on drags.
           *
           *    The source of the jitter seems to be when the 
           *    background is dragged.
           */
          const target = workspace.findItemByCoordinates(x,y) || workspace;
          listener(viewer, target, x, y, dx, dy);
        };
      },

      layout(listener, workspace) {
        return function handleLayout(viewer) {
          if (workspace.hasViewer(viewer)) { 
            listener(viewer);
            return true;
          }
          return false;
        };
      },

      scale(listener, workspace) {
        return function handleScale(viewer, scale) {
          listener(viewer, scale);
        };
      },
    }),
  });

  const ListenerFactory = Object.freeze({
    build(type, listener, workspace) {
      if (typeof listener !== 'function') {
        throw 'Attached listener must be a function';
      } 
      if (!(workspace instanceof WorkSpace)) {
        throw 'Cannot listen with an invalid workspace';
      }
      return locals.BLUEPRINTS[type](listener, workspace);
    },
    TYPES: Object.keys(locals.BLUEPRINTS),
  });

  return ListenerFactory;
})();

/*
 * The WorkSpace keeps track of viewers and items, and can handle events on those
 * items and viewers which allow them to be interacted with.
 */
const WorkSpace = (function defineWorkSpace() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      bounds: {
        x: 10000,
        y: 10000,
      },
      clientLimit: 10,
      color: '#aaaaaa',
    }),
    STAMPER: new WamsShared.IDStamper(),
  });

  class WorkSpace {
    constructor(settings) {
      this.settings = WamsShared.initialize(locals.DEFAULTS, settings);
      locals.STAMPER.stamp(this);

      // Things to track.
      // this.subWS = [];
      this.viewers = [];
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
      this.handlers[message](...args);
    }

    hasViewer(viewer) {
      return this.viewers.some( u => u.id === viewer.id );
    }

    isFull() {
      return this.viewers.length >= this.settings.clientLimit;  
    }

    on(event, listener) {
      const type = event.toLowerCase();
      this.handlers[type] = ListenerFactory.build(type, listener, this);
    }

    removeViewer(viewer) {
      return WamsShared.safeRemoveByID( this.viewers, viewer, ServerViewer );
    }

    removeItem(item) {
      return WamsShared.safeRemoveByID( this.items, item, ServerItem );
    }

    reportViewers() {
      return this.viewers.map( v => v.report() );
    }

    reportItems() {
      return this.items.map( o => o.report() );
    }

    spawnViewer(values) {
      if (!this.isFull()) {
        const u = new ServerViewer(this.settings.bounds, values);
        this.viewers.push(u);
        return u;
      }
      return false;
    }

    spawnItem(values) {
      const o = new ServerItem(values);
      this.items.push(o);
      return o;
    }
  }

  return WorkSpace;
})();

/*
 * A Connection maintains a socket.io connection between a client and the
 * server. It tracks a viewer associated with the client, as well as the 
 * associated workspace.
 */
const Connection = (function defineConnection() {
  const locals = Object.freeze({
    LOCAL_HANDLERS: Object.freeze({ 
      [globals.MSG_DISCONNECT]: 'disconnect',
      [globals.MSG_RESIZE]:     'resize',
    }),

    WORKSPACE_HANDLERS: Object.freeze({ 
      [globals.MSG_CLICK]:  'click',
      [globals.MSG_DRAG]:   'drag',
      [globals.MSG_SCALE]:  'scale',
      [globals.MSG_LAYOUT]: 'layout',
    }),
  });

  class Connection {
    constructor(socket, workspace) {
      this.socket = socket;
      this.workspace = workspace;
      this.viewer = this.workspace.spawnViewer();
      if (!this.viewer) {
        console.log(this.viewer);
        this.socket.disconnect(true);
        return false;
      }

      Object.entries(locals.LOCAL_HANDLERS).forEach( ([p,v]) => {
        this.socket.on(p, this[v].bind(this));
      });

      Object.entries(locals.WORKSPACE_HANDLERS).forEach( ([p,v]) => {
        this.socket.on(p, (...args) => {
          this.passMessageToWorkspace(v, ...args);
        }); 
      });

      this.socket.emit(globals.MSG_INIT, {
        viewers: this.workspace.reportViewers(),
        items: this.workspace.reportItems(),
        color: this.workspace.settings.color,
        id: this.viewer.id,
      });
    }

    /*
     * XXX: This might be a place where socket.io 'rooms' could
     *    come in handy. Look into it...
     */
    broadcast(event, data) {
      this.socket.emit(event, data);
      this.socket.broadcast.emit(event, data);
    }

    broadcastItemReport() {
      this.broadcast(
        globals.MSG_UD_ITEMS,
        this.workspace.reportItems()
      );
    }

    broadcastViewReport() {
      this.broadcast(
        globals.MSG_UD_VIEW,
        this.viewer.report()
      );
    }

    disconnect() {
      if (this.workspace.removeViewer(this.viewer)) {
        this.broadcast(globals.MSG_RM_VIEW, this.viewer.id);
        this.socket.disconnect(true);
        console.log(`viewer ${this.viewer.id} ` +
          `disconnected from workspace ${this.workspace.id}`
        );
      } else {
        console.error('Failed to disconnect:', this);
      }
    }

    passMessageToWorkspace(message, ...args) {
      this.workspace.handle(message, this.viewer, ...args);
      this.broadcastItemReport();
      this.broadcastViewReport();
    }

    resize(data) {
      if (this.viewer.id === data.id) {
        this.viewer.assign(data);
        this.broadcastViewReport()
      }
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
    const viewer = path.join(__dirname, '../src/view.html');
    const shared = path.join(__dirname, '../src/shared.js');
    const client = path.join(__dirname, '../src/client.js');
    app.get('/',          (req, res) => res.sendFile(viewer)    );
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
     *    - When this.app.use() is called without a 'path' argument, as it 
     *      is here, it uses the default '/' argument, with the 
     *      result that these callbacks will be executed for 
     *      _every_ request to the app!
     *      + Should therefore consider specifying the path!!
     *    - Should also consider specifying options. Possibly useful:
     *      + immutable
     *      + maxAge
     */
    const images = path.join(__dirname, './Images');
    const libs = path.join(__dirname, '../libs');
    app.use(express.static(images));
    app.use(express.static(libs));
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
  const io = require('socket.io');
  const os = require('os');

  const locals = Object.freeze({
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

  class WamsServer {
    constructor(workspace) {
      this.workspace = workspace;
      this.server = http.createServer(new RequestHandler());

      this.io = io.listen(this.server);
      this.io.on('connection', (socket) => {
        const c = new Connection(socket, this.workspace);
        if (c) {
          this.connections.push(c);
          console.log(
            `Viewer ${c.viewer.id} connected to workspace listening on port`,
            this.server.address().port
          );
        }
      });

      /*
       * XXX: Not necessary to actually track connections like this, doing it
       *      for debugging assistance, for now.
       */
      this.connections = [];
    }

    /*
     * For modularity, may want to refactor this to allow the user to have more
     * control over server establishment.
     */
    listen(port = locals.PORT, host = locals.getLocalIP()) {
      this.server.listen(port, host, () => {
        console.log('Listening on', this.server.address());
      });
    }
  }

  return WamsServer;
})();

exports.ServerItem = ServerItem;
exports.ServerViewer = ServerViewer;
exports.ListenerFactory = ListenerFactory;
exports.WorkSpace = WorkSpace;
exports.Connection = Connection;
exports.RequestHandler = RequestHandler;
exports.WamsServer = WamsServer;

exports.Item = ServerItem;

