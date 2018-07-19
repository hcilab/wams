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
const http = require('http');
const io = require('socket.io');
const WamsShared = require('./shared.js');

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 *
 * Right now all it does though is copy the constants from WamsShared, so I
 * might simplify it a bit.
 */
const globals = (function defineGlobals() {
  const rv = {};

  /*
   * I centralized some constant descriptions in the shared file, so collect 
   * them from there.
   */
  Object.entries(WamsShared.constants).forEach( ([p,v]) => {
    Object.defineProperty(rv, p, {
      value: v,
      configurable: false,
      enumerable: true,
      writable: false
    });
  });

  return Object.freeze(rv);
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
    app.get('/client.js', (req, res) => res.sendFile()        );
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
 * Treat this factory as a static class with no constructor. If you try to
 * instantiate it with the 'new' keyword you will get an exception. Its primary
 * usage is for generating appropriate listeners via its 'build' function.
 */
const ListenerFactory = (function defineListenerFactory() {
  const locals = Object.freeze({
    BLUEPRINTS: Object.freeze({
      click(listener, workspace) {
        return function handleClick(viewspace, x, y) {
          const target = workspace.findObjectByCoordinates(x,y) || workspace;
          listener(target, viewspace, x, y);
        };
      },

      drag(listener, workspace) {
        return function handleDrag(viewspace, x, y, dx, dy) {
          /*
           * XXX: This is causing jitter. Will have to look in the 
           *    debugger, perhaps multiple events are firing on drags.
           *
           *    The source of the jitter seems to be when the 
           *    background is dragged.
           */
          const target = workspace.findObjectByCoordinates(x,y) || workspace;
          listener(target, viewspace, x, y, dx, dy);
        };
      },

      layout(listener, workspace) {
        return function handleLayout(viewspace) {
          if (workspace.hasView(viewspace)) { 
            listener(workspace, viewspace);
            return true;
          }
          return false;
        };
      },

      scale(listener, workspace) {
        return function handleScale(viewspace, scale) {
          listener(viewspace, scale);
        };
      },
    }),
  });

  const ListenerFactory = Object.freeze({
    build(type, listener, workspace) {
      if (typeof listener !== 'function') {
        throw 'Attached listener must be a function';
      } else if (!workspace instanceof WorkSpace) {
        throw 'Cannot listen with an invalid workspace';
      }
      return locals.BLUEPRINTS[type](listener, workspace);
    },
    TYPES: Object.keys(locals.BLUEPRINTS),
  });

  return ListenerFactory;
})();

const WorkSpace = (function defineWorkSpace() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      debug: false,
      color: '#aaaaaa',
      bounds: {
        x: 10000,
        y: 10000,
      },
      clientLimit: 10,
    }),
    PORT: 9000,
    STAMPER: new WamsShared.IDStamper(),

    getLocalIP() {
      const os = require('os');
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

    removeByItemID(array, item) {
      const idx = array.findIndex( o => o.id === item.id );
      if (idx >= 0) {
        array.splice(idx, 1);
        return true;
      }
      return false;
    },
  });

  class WorkSpace {
    constructor(port = locals.PORT, settings) {
      this.settings = WamsShared.initialize(locals.DEFAULTS, settings);
      locals.STAMPER.stamp(this, port);

      // Things to track.
      this.connections = [];
      this.subWS = [];
      this.views = [];
      this.wsObjects = [];

      // Will be used for establishing a server on which to listen.
      this.http = null;
      this.io = null;
      this.port = this.id;
      WamsShared.makeOwnPropertyImmutable(this, 'port');

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

    addSubWS(subWS) {
      this.subWS.push(subWS);
      //TODO: add check to make sure subWS is in bounds of the main workspace
      //TODO: probably send a workspace update message
    }

    addWSObject(obj) {
      this.wsObjects.push(obj);
    }

    findObjectByCoordinates(x,y) {
      return this.wsObjects.find( o => o.containsPoint(x,y) );
    }

    hasView(view) {
      return this.views.some( u => u.id === view.id );
    }

    isFull() {
      return this.views.length >= this.settings.clientLimit;  
    }

    listen() {
      this.http = http.createServer(new RequestHandler());
      this.http.listen(this.id, locals.getLocalIP(), () => {
        console.log('Listening on', this.http.address());
      });
      this.io = io.listen(this.http);
      this.io.on('connection', (socket) => {
        this.connections.push(new Connection(socket, this));
      });
    }

    on(event, listener) {
      const type = event.toLowerCase();
      this.handlers[type] = ListenerFactory.build(type, listener, this);
    }

    removeView(view) {
      return locals.removeByItemID(this.views, view);
    }

    removeWSObject(obj) {
      return locals.removeByItemID(this.wsObjects, obj);
    }

    reportViews() {
      return this.views.map( v => v.report() );
    }

    reportWSObjects() {
      return this.wsObjects.map( o => o.report() );
    }

    spawnView() {
      if (!this.isFull()) {
        const u = new ServerViewSpace(this.settings.bounds);
        this.views.push(u);
        return u;
      }
      return false;
    }
  }

  return WorkSpace;
})();

class Connection {
  constructor(socket, workspace) {
    /*
     * XXX: Make the desired bounds an argument passed into the
     *    constructor?
     */
    this.initializedLayout = false;
    this.socket = socket;
    this.workspace = workspace;
    this.viewSpace = this.workspace.spawnView();
    if (!this.viewSpace) {
      this.socket.disconnect(true);
      return undefined;
    }

    console.log(
      `View ${this.viewSpace.id} ` +
      `connected to workspace ${this.workspace.id}`
    );

    /*
     * XXX: This is a nifty way of making it easy to add and remove
     *      event strings to this list, but is it really that good of an
     *      idea? Is it readable?
     *
     *      Maybe this needs to be extracted into its own class!
     */
    [   
      {msg: globals.MSG_DISCONNECT, handler: 'disconnect'},
      {msg: globals.MSG_CLICK,      handler: 'click'},
      {msg: globals.MSG_DRAG,       handler: 'drag'},
      {msg: globals.MSG_SCALE,      handler: 'scale'},
      {msg: globals.MSG_UPDATE,     handler: 'update'},
      {msg: globals.MSG_LAYOUT,     handler: 'layout'},
    ].forEach( e => this.socket.on(e.msg, this[e.handler].bind(this)) );

    this.socket.emit(globals.MSG_INIT, {
      views: this.workspace.reportViews(),
      wsObjects: this.workspace.reportWSObjects(),
      settings: this.workspace.settings,
      id: this.viewSpace.id,
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

  broadcastViewReport() {
    this.broadcast(
      globals.MSG_UD_VIEW,
      this.viewSpace.report()
    );
  }

  broadcastObjectReport() {
    this.broadcast(
      globals.MSG_UD_OBJS,
      this.workspace.reportWSObjects()
    );
  }

  /*
   * XXX: Shouldn't we disconnect the socket???
   */
  disconnect() {
    if (this.workspace.removeView(this.viewSpace.id)) {
      console.log(
        `view ${this.viewSpace.id} ` +
        `disconnected from workspace ${this.workspace.id}`
      );
      this.broadcast(globals.MSG_RM_VIEW, this.viewSpace.id);
      this.socket.disconnect(true);
    } else {
      throw 'Failed to disconnect.'
    }
  }

  /*
   * XXX: handleClick and handleDrag can probably be collapsed down to more
   *    or less the same function. The only difference is the name of
   *    the handler and the arguments, but I think we can just pass the
   *    arguments through with some JavaScript operator or function...
   *
   *    That said, we should probably figure out why handleDrag is checking
   *    the viewSpace id but handleClick is not...
   */
  click(x, y) {
    this.workspace.click(this.viewSpace, x, y);
    this.broadcastViewReport();
    this.broadcastObjectReport();
  }

  drag(viewspace, x, y, dx, dy) {
    if (viewspace.id !== this.viewSpace.id) return;
    this.workspace.drag(viewspace, x, y, dx, dy);
    this.broadcastObjectReport()
    this.broadcastViewReport();
  }

  scale(vs, newScale) {
    // Failsafe checks.
    if (vs.id !== this.viewSpace.id) return;
    this.workspace.scale(vs, newScale);
    this.broadcastViewReport()
  }

  layout() {
    if (!this.workspace.layout(this.viewSpace)) {
      this.socket.send(globals.MSG_DC_VIEW);
    }
  }

  /*
   * XXX: What exactly does reportView do? The name is ambiguous, so once I
   *    figure this out I will definitely change it.
   */
  update(vsInfo) {
    if (this.viewSpace.id === vsInfo.id) {
      this.viewSpace.assign(vsInfo);
      this.broadcastViewReport()
    }
  }
}

const ServerWSObject = (function defineServerWSObject() {
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

  class ServerWSObject extends WamsShared.WSObject {
    /*
     * XXX: What is the object supposed to be if the draw strings are not 
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

  return ServerWSObject;
})();

const ServerViewSpace = (function defineServerViewSpace() {
  const locals = Object.freeze({
    DEFAULTS: {
      x: 0,
      y: 0,
      width: 1600,
      height: 900,
      type: 'view/background',
      effectiveWidth: 1600,
      effectiveHeight: 900,
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

  class ServerViewSpace extends WamsShared.ViewSpace {
    /*
     * XXX: At some point, the effective width and height should be made to be
     *      updated whenever either the width, height, or scale of the
     *      viewspace get updated. This could be achieve with getters and 
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
     * center of the viewspace along that dimension.
     */
    get center()  {
      return ((view) => {
        return Object.freeze({
          get x() { return view.x + (view.effectiveWidth  / 2); },
          get y() { return view.y + (view.effectiveHeight / 2); },
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
     * it easier to push the viewspace into the boundaries.
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
     * ViewSpaces are constrained to stay within the boundaries of the
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
     * viewspace. So a larger scale means that each portion of the workspace
     * takes up more of the viewspace, therefore _less_ of the workspace is
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

  return ServerViewSpace;
})();

exports.WorkSpace = WorkSpace;
exports.WSObject = ServerWSObject;

/*
 * For testing:
 */
exports.Connection = Connection;
exports.ServerWSObject = ServerWSObject;
exports.ServerViewSpace = ServerViewSpace;
exports.RequestHandler = RequestHandler;
exports.ListenerFactory = ListenerFactory;

