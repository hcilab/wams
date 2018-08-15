/*
 * WAMS code to be executed in the client browser.
 *
 * Original author: Jesse Rolheiser
 * Revised by: Scott Bateman
 * Latest edition by: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

/*
 * If operating in a node.js environment, import the requisite libraries.
 */
if (typeof global !== 'undefined' && typeof require === 'function') {
  global.io = require('socket.io-client');
  global.WamsShared = require('../src/shared.js');
  global.ZingTouch = require('../libs/zingtouch.js');
  global.cseq = require('../libs/canvas_sequencer.js');
  global.Blueprint = cseq.Blueprint;
}

// Rename Blueprint for clarity.
const SequenceBlueprint = Blueprint;

/*
 * Provide an alias for the shared set of constants between server and client.
 */
const globals = Object.freeze(WamsShared.constants);

/*
 * The ShadowViewer class exposes a simple draw() function which renders a
 * shadowy outline of the viewer onto the canvas.
 */
const ShadowViewer = (function defineShadowViewer() {
  const locals = Object.freeze({
    STAMPER: new WamsShared.IDStamper(),
  });

  class ShadowViewer extends WamsShared.Viewer {
    constructor(values) {
      super(values);
      locals.STAMPER.cloneId(this, values.id);
    }

    draw(context) {
      context.save();
      context.translate(this.x,this.y);
      context.rotate((Math.PI * 2) - this.rotation);
      context.strokeStyle = 'rgba(0,0,0,0.5)';
      context.lineWidth = 5;
      context.strokeRect( 0, 0, this.effectiveWidth, this.effectiveHeight);
      context.restore();
    }
  }
  
  return ShadowViewer;
})();

/*
 * The ClientItem class exposes the draw() funcitonality of wams items.
 */
const ClientItem = (function defineClientItem() {
  /*
   * I'm not defining a 'defaults' object here, because the data going into
   * the creation of items should always come from the server, where it has
   * already gone through an initialization against a defaults object.
   */
  const locals = Object.freeze({
    STAMPER: new WamsShared.IDStamper(),
    createImage(src) {
      if (src) {
        const img = new Image();
        img.src = src;
        img.loaded = false;
        img.addEventListener(
          'load',
          () => {
            img.loaded = true;
            const evt = new CustomEvent('wams-image-loaded');
            document.dispatchEvent(evt);
          },
          {once:true}
        );
        return img;
      }
      return null;
    }
  });

  class ClientItem extends WamsShared.Item {
    constructor(data) {
      super(data);
      locals.STAMPER.cloneId(this, data.id);
    }

    assign(data) {
      const updateImage = data.imgsrc !== this.imgsrc;
      const updateBlueprint = data.hasOwnProperty('blueprint');

      super.assign(data);
      if (updateImage) this.img = locals.createImage(this.imgsrc);
      if (updateBlueprint) {
        this.blueprint = SequenceBlueprint.fromString(this.blueprint);
      }

      // Rather than doing a bunch of checks, let's just always rebuild the
      // sequence when updating any data in the item.
      if (this.blueprint) {
        this.sequence = this.blueprint.build(this.report());
      }
    }

    draw(context) {
      const width = this.width || this.img.width;
      const height = this.height || this.img.height;

      if (this.sequence) {
        this.sequence.execute(context);
      } else if (this.img && this.img.loaded) {
        context.drawImage(this.img, this.x, this.y, width, height);
      } else {
        context.save();
        context.fillStyle = '#252525';
        context.fillRect(this.x, this.y, width, height);
        context.restore();
      }
    }
  }

  return ClientItem;
})();

/*
 * The ClientViewer class is used for all rendering activities on the client
 * side. This is essentially the view in a modal-view-controller esque design.
 */
const ClientViewer = (function defineClientViewer() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      x: 0,
      y: 0,
      rotation: globals.ROTATE_0,
      scale: 1,
      type: 'view/background',
    }),
    REQUIRED_DATA: Object.freeze([
      'id',
      'items',
      'viewers',
    ]),
    STAMPER: new WamsShared.IDStamper(),
  });

  class ClientViewer extends WamsShared.Viewer {
    constructor(values = {}) {
      super(WamsShared.getInitialValues(locals.DEFAULTS, values));

      if (values.context) this.context = values.context;
      // else throw 'ClientViewer requires a CanvasRenderingContext2D!';

      this.items = [];
      this.shadows = [];
      this.resizeToFillWindow();
      document.addEventListener( 'wams-image-loaded', () => this.draw() );
    }

    addItem(values) {
      this.items.push(new ClientItem(values));
    }

    addShadow(values) {
      this.shadows.push(new ShadowViewer(values));
    }

    draw() {
      this.context.save();
      wipeAndReposition.call(this);
      this.items.forEach( o => o.draw(this.context) );
      this.shadows.forEach( v => v.draw(this.context) );
      showStatus.call(this);
      this.context.restore();

      function wipeAndReposition() {
        /*
         * WARNING: If you're like me, you'll be tempted to use the transform()
         * or setTransform() functions. Don't. They throw off the user input
         * data in unpredictable ways.
         */
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.context.scale(this.scale, this.scale);
        this.context.rotate(this.rotation);
        this.context.translate(-this.x, -this.y);
      }

      function showStatus() {
        const messages = Object.keys(locals.DEFAULTS)
          .map( k => {
            if (typeof this[k] === 'number') {
              return `${k}: ${this[k].toFixed(2)}`;
            } else {
              return `${k}: ${this[k]}`;
            }
          })
          .concat([`# of Shadows: ${this.shadows.length}`]);
        let ty = 40;
        let tx = 20;
        this.context.save();
        this.context.setTransform(1,0,0,1,0,0);
        this.context.font = '18px Georgia';
        messages.forEach( m => {
          this.context.fillText(m, tx, ty);
          ty += 20;
        });
        this.context.restore();
      }
    }

    handle(message, ...args) {
      this[message](...args);
      this.draw();
    }

    removeItem(item) {
      return WamsShared.removeByID( this.items, item, ClientItem );
    }

    removeShadow(shadow) {
      return WamsShared.removeByID( this.shadows, shadow, ShadowViewer );
    }

    resizeToFillWindow() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.effectiveWidth = this.width / this.scale;
      this.effectiveHeight = this.height / this.scale;
    }

    setup(data) {
      locals.REQUIRED_DATA.forEach( d => {
        if (!data.hasOwnProperty(d)) throw `setup requires: ${d}`;
      });
      locals.STAMPER.cloneId(this, data.id);
      data.viewers.forEach( v => v.id !== this.id && this.addShadow(v) );
      data.items.forEach( o => this.addItem(o) );
      this.draw(); 
    }

    updateItem(data) {
      const item = this.items.find( i => i.id === data.id );
      if (item) item.assign(data);
      else console.warn('Unable to find item to be updated.');
    }

    updateShadow(data) {
      const shadow = this.shadows.find( v => v.id === data.id );
      if (shadow) shadow.assign(data);
      else console.warn('Unable find shadow to be updated.');
    }
  }

  return ClientViewer;
})();

/*
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.
 */
const Interactor = (function defineInteractor() {
  /*
   * Currently, the Interactor makes use of the ZingTouch library.
   *
   * General Design:
   *  The handlers will get called with the arguments that need to be reportd
   *  through to the server. This allows the ClientController to use this class
   *  in a very simple way. This is the contract between the Interactor and the
   *  ClientController, and must be honoured.
   *
   *  The handlers are initialized to NOPs so that the functions which call the
   *  handlers don't need to check whether the handler exists.
   *
   *  The methods of this class that are similarly named as the handlers are
   *  there as an intermediary to collect data from events and call the handlers
   *  with only the requisite data.
   */
  const locals = Object.freeze({
    HANDLERS: Object.freeze({ 
      tap: WamsShared.NOP,
      pan: WamsShared.NOP,
      zoom: WamsShared.NOP,
    }),
  });

  class Interactor {
    constructor(canvas, handlers = {}) {
      this.canvas = canvas;
      this.region = ZingTouch.Region(this.canvas, true, true);
      this.handlers = WamsShared.getInitialValues(locals.HANDLERS, handlers);
      this.bindRegions();
      window.addEventListener('wheel', this.wheel.bind(this), false);
    }

    bindRegions() {
      /*
       * this.region.bind() attaches a gesture recognizer and a callback to an
       * element.
       */
      const pan = this.pan.bind(this);
      const tap = this.tap.bind(this);
      const pinch = this.pinch.bind(this);

      this.region.bind(this.canvas, this.panner(), pan);
      this.region.bind(this.canvas, this.tapper(), tap);
      this.region.bind(this.canvas, this.pincher('Pinch'), pinch);
      this.region.bind(this.canvas, this.pincher('Expand'), pinch);
    }

    pan({detail}) {
      const event = detail.events[0];
      const data = detail.data[0];
      this.handlers.pan(
        event.clientX,
        event.clientY,
        data.movement.x,
        data.movement.y
      );
    }

    panner() {
      const pan = new ZingTouch.Pan();
      const panMove = pan.move;
      pan.move = refinePanMove;
      return pan;

      /*
       * Custom functionality overtop of standard ZingTouch behaviour.
       * TODO: Fork ZingTouch and add this behaviour, so this isn't necessary.
       */
      function refinePanMove(inputs, state, element) {
        const progress = inputs[0].getGestureProgress(this.getId());
        const movement = {
          x: inputs[0].current.x - progress.lastEmitted.x,  
          y: inputs[0].current.y - progress.lastEmitted.y,
        };
        const output = panMove.call(this, inputs, state, element);
        if (output) output.data[0].movement = movement;
        return output;
      }
    }

    pinch({detail}) {
      this.handlers.zoom(detail.change * 0.009);
    }

    pincher(PinchOrExpand = 'Pinch') {
      const gesture = new ZingTouch[PinchOrExpand]();
      const gestureMove = gesture.move;
      gesture.move = refinePinchMove;
      return gesture;

      /*
       * Custom functionality overtop of standard ZingTouch behaviour.
       * TODO: Fork ZingTouch and add this behaviour, so this isn't necessary.
       */
      function refinePinchMove(inputs, state, element) {
        const progress = inputs[0].getGestureProgress(this.getId());
        const lastDistance = progress.lastEmittedDistance;
        const data = gestureMove.call(this, inputs, state, element);
        if (data) data.change = data.distance - lastDistance;
        return data;
      }
    }

    tap({detail}) {
      const event = detail.events[0];
      this.handlers.tap( event.clientX, event.clientY );
    }

    tapper() {
      return new ZingTouch.Tap({ tolerance: 4 });
    }

    wheel(event) {
      event.preventDefault();
      const factor = event.ctrlKey ? 0.05 : 0.01;
      this.handlers.zoom(-(event.deltaY * factor));
    }
  }

  return Interactor;
})();

/*
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view. This is essentially the
 * controller in a model-view-controller esque design.
 */
const ClientController = (function defineClientController() {
  const Message = WamsShared.Message;
  const locals = Object.freeze({
    STAMPER: new WamsShared.IDStamper(),
  });

  const symbols = Object.freeze({
    attach_listeners: Symbol(),
  });

  class ClientController { 
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.socket = null;
      this.viewer = new ClientViewer({ context: this.context });
      this.interactor = new Interactor(this.canvas, {
        tap: this.tap.bind(this),
        pan: this.pan.bind(this),
        zoom: this.zoom.bind(this),
      });

      this.resizeCanvasToFillWindow();
      window.addEventListener('resize', this.resize.bind(this), false);

      this.socket = io.connect( globals.NS_WAMS, {
        autoConnect: false,
        reconnection: false,
      });
      this[symbols.attach_listeners]();
      this.socket.connect();
    }

    [symbols.attach_listeners]() {
      const listeners = {
        // For the server to inform about changes to the model
        [Message.ADD_ITEM]:   (...args) => this.handle('addItem', ...args),
        [Message.ADD_SHADOW]: (...args) => this.handle('addShadow', ...args),
        [Message.RM_ITEM]:    (...args) => this.handle('removeItem', ...args),
        [Message.RM_SHADOW]:  (...args) => this.handle('removeShadow', ...args),
        [Message.UD_ITEM]:    (...args) => this.handle('updateItem', ...args),
        [Message.UD_SHADOW]:  (...args) => this.handle('updateShadow', ...args),
        [Message.UD_VIEWER]:  (...args) => this.handle('assign', ...args),

        // Connection establishment related (disconnect, initial setup)
        [Message.INITIALIZE]: (...args) => this.setup(...args),
        [Message.LAYOUT]:     WamsShared.NOP,

        // User event related
        [Message.CLICK]:  WamsShared.NOP,
        [Message.DRAG]:   WamsShared.NOP,
        [Message.RESIZE]: WamsShared.NOP,
        [Message.SCALE]:  WamsShared.NOP,

        'wams-full': () => document.body.innerHTML = 'WAMS is full! :(',
      };

      Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
    }

    handle(message, ...args) {
      this.viewer.handle(message, ...args);
    }

    pan(x, y, dx, dy) {
      const mreport = new WamsShared.MouseReporter({ x, y, dx, dy });
      console.log(mreport);
      new Message(Message.DRAG, mreport).emitWith(this.socket);
    }

    resize() {
      this.resizeCanvasToFillWindow();
      this.viewer.resizeToFillWindow();
      this.viewer.draw();
      new Message(Message.RESIZE, this.viewer).emitWith(this.socket);
    }

    resizeCanvasToFillWindow() {
      this.canvas.width = window.innerWidth; 
      this.canvas.height = window.innerHeight;
    }

    setup(data) {
      locals.STAMPER.cloneId(this, data.id);
      this.canvas.style.backgroundColor = data.color;
      this.viewer.setup(data);
      new Message(Message.LAYOUT, this.viewer).emitWith(this.socket);
    }

    tap(x, y) {
      const mreport = new WamsShared.MouseReporter({ x, y });
      console.log(mreport);
      new Message(Message.CLICK, mreport).emitWith(this.socket);
    }

    zoom(diff) {
      const scale = this.viewer.scale + diff;
      const sreport = new WamsShared.ScaleReporter({ scale });
      console.log(sreport);
      new Message(Message.SCALE, sreport).emitWith(this.socket);
    }
  }

  return ClientController;
})();

// Entry point!
window.addEventListener(
  'load', 
  function run() {
    new ClientController(document.querySelector('canvas'));
  },
  {
    capture: false,
    once: true,
    passive: true,
  }
);

/*
 * If operating in a node.js environment, export the appropriate classes.
 */
if (typeof exports !== 'undefined') {
  exports.ShadowViewer = ShadowViewer;
  exports.ClientItem = ClientItem;
  exports.ClientViewer = ClientViewer;
  exports.ClientController = ClientController;
}

