/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

/*
 * SOME NOTES ABOUT CANVAS RENDERING:
 *  - Avoid using shadows. They appear to kill the framerate.
 */

'use strict';

/*
 * If operating in a node.js environment, import the requisite libraries.
 * This is to allow automated testing.
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
 * The ShadowView class exposes a simple draw() function which renders a
 * shadowy outline of the view onto the canvas.
 */
const ShadowView = (function defineShadowView() {
  const locals = Object.freeze({
    STAMPER: new WamsShared.IdStamper(),
    COLOURS: [
      'saddlebrown',
      'darkred',
      'darkblue',
      'darkgreen',
      'goldenrod',
      'orangered',
      'purple',
      'fuschia',
      'aqua',
      'lime',
    ],
  });

  class ShadowView extends WamsShared.View {
    constructor(values) {
      super(values);
      locals.STAMPER.cloneId(this, values.id);
    }

    draw(context) {
      /*
       * WARNING: It is *crucial* that this series of instructions be wrapped in
       * save() and restore().
       */
      context.save();
      align.call(this, context);
      setStyles.call(this, context);
      drawOutline.call(this, context);
      drawTopLeftMarker.call(this, context);
      context.restore();

      function align(context) {
        context.translate(this.x,this.y);
        context.rotate((Math.PI * 2) - this.rotation);
      }

      function setStyles(context) {
        context.globalAlpha = 0.5;
        context.strokeStyle = locals.COLOURS[this.id % locals.COLOURS.length];
        context.fillStyle = context.strokeStyle;
        context.lineWidth = 5;
      }

      function drawOutline(context) {
        context.strokeRect( 0, 0, this.effectiveWidth, this.effectiveHeight);
      }

      function drawTopLeftMarker(context) {
        const base = context.lineWidth / 2;
        const height = 25;

        context.beginPath();
        context.moveTo(base,base);
        context.lineTo(base,height);
        context.lineTo(height,base);
        context.lineTo(base,base);
        context.fill();
      }
    }
  }
  
  return ShadowView;
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
    STAMPER: new WamsShared.IdStamper(),
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
      // sequence when updating any data in the item. Doing the checks to see if
      // this is necessary would probably take as much or more time as just
      // going ahead and rebuilding like this anyway.
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
        // Draw placeholder rectangle.
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
 * The ClientView class is used for all rendering activities on the client
 * side. This is essentially the view in an MVC-esque design.
 */
const ClientView = (function defineClientView() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      x: 0,
      y: 0,
      rotation: globals.ROTATE_0,
      scale: 1,
      type: 'view/background',
    }),
    STATUS_KEYS: Object.freeze([
      'x',
      'y',
      'width',
      'height',
      'effectiveWidth',
      'effectiveHeight',
      'rotation',
      'scale',
    ]),
    REQUIRED_DATA: Object.freeze([
      'id',
      'items',
      'views',
    ]),
    STAMPER: new WamsShared.IdStamper(),
  });

  class ClientView extends WamsShared.View {
    constructor(values = {}) {
      super(WamsShared.getInitialValues(locals.DEFAULTS, values));

      if (values.context) this.context = values.context;
      // else throw 'ClientView requires a CanvasRenderingContext2D!';

      this.items = [];
      this.shadows = [];
      document.addEventListener( 'wams-image-loaded', () => this.draw() );
    }

    addItem(values) {
      this.items.push(new ClientItem(values));
    }

    addShadow(values) {
      this.shadows.push(new ShadowView(values));
    }

    draw() {
      this.context.save();
      wipeAndRealign(this);
      drawItems(this);
      drawShadows(this);
      showStatus(this);
      this.context.restore();

      function wipeAndRealign(view) {
        /*
         * WARNING: It is crucially important that the instructions below occur
         * in *precisely* this order!
         */
        view.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        view.context.scale(view.scale, view.scale);
        view.context.rotate(view.rotation);
        view.context.translate(-view.x, -view.y);
      }

      function drawItems(view) {
        view.items.forEach( o => o.draw(view.context) );
      }

      function drawShadows(view) {
        view.shadows.forEach( v => v.draw(view.context) );
      }

      function showStatus(view) {
        const messages = locals.STATUS_KEYS
          .map( k => `${k}: ${view[k].toFixed(2)}` )
          .concat([`# of Shadows: ${view.shadows.length}`]);
        let ty = 40;
        let tx = 20;
        view.context.save();
        view.context.setTransform(1,0,0,1,0,0);
        view.context.font = '18px Georgia';
        messages.forEach( m => {
          view.context.fillText(m, tx, ty);
          ty += 20;
        });
        view.context.restore();
      }
    }

    handle(message, ...args) {
      this[message](...args);
      this.draw();
    }

    removeItem(item) {
      return WamsShared.removeById( this.items, item, ClientItem );
    }

    removeShadow(shadow) {
      return WamsShared.removeById( this.shadows, shadow, ShadowView );
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
      data.views.forEach( v => v.id !== this.id && this.addShadow(v) );
      data.items.forEach( o => this.addItem(o) );
      this.draw(); 
    }

    update(container, data) {
      const object = this[container].find( o => o.id === data.id );
      if (object) object.assign(data);
      else console.warn(`Unable to find in ${container}: id: `, data.id);
    }

    updateItem(data) {
      this.update('items', data);
    }

    updateShadow(data) {
      this.update('shadows', data);
    }
  }

  return ClientView;
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
      pan: WamsShared.NOP,
      rotate: WamsShared.NOP,
      tap: WamsShared.NOP,
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
      const rotate = this.rotate.bind(this);

      this.region.bind(this.canvas, this.panner(), pan);
      this.region.bind(this.canvas, this.tapper(), tap);
      this.region.bind(this.canvas, this.pincher('Pinch'), pinch);
      this.region.bind(this.canvas, this.pincher('Expand'), pinch);
      this.region.bind(this.canvas, this.rotater(), rotate);
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

    rotate({detail}) {
      const degrees = detail.distanceFromLast;
      const radians = degrees * Math.PI / 180;
      this.handlers.rotate( radians );
    }

    rotater() {
      const rotate = new ZingTouch.Rotate();
      const rotateMove = rotate.move;
      rotate.move = refineRotateMove;
      return rotate;

      /*
       * Custom functionality overtop of standard ZingTouch behaviour.
       * TODO: Fork ZingTouch and add this behaviour, so this isn't necessary.
       */
      function refineRotateMove(inputs, state, element) {
        if (state.numActiveInputs() === 2) {
          return rotateMove.call(this, inputs, state, element);
        }
        return null;
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
      const factor = event.ctrlKey ? 0.10 : 0.02;
      this.handlers.zoom(-(Math.sign(event.deltaY) * factor));
    }
  }

  return Interactor;
})();

/*
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view. This is essentially the
 * controller in an MVC-esque design.
 */
const ClientController = (function defineClientController() {
  const Message = WamsShared.Message;
  const locals = Object.freeze({
    STAMPER: new WamsShared.IdStamper(),
  });

  const symbols = Object.freeze({
    attach_listeners: Symbol(),
  });

  class ClientController { 
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.socket = null;
      this.view = new ClientView({ context: this.context });
      this.interactor = new Interactor(this.canvas, {
        pan:    this.pan.bind(this),
        rotate: this.rotate.bind(this),
        tap:    this.tap.bind(this),
        zoom:   this.zoom.bind(this),
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
        [Message.UD_VIEW]:  (...args) => this.handle('assign', ...args),

        // Connection establishment related (disconnect, initial setup)
        [Message.INITIALIZE]: (...args) => this.setup(...args),
        [Message.LAYOUT]:     WamsShared.NOP,

        // User event related
        [Message.CLICK]:  WamsShared.NOP,
        [Message.DRAG]:   WamsShared.NOP,
        [Message.RESIZE]: WamsShared.NOP,
        [Message.ROTATE]: WamsShared.NOP,
        [Message.SCALE]:  WamsShared.NOP,

        /*
         * TODO: This could be more... elegant...
         */
        'wams-full': () => document.body.innerHTML = 'WAMS is full! :(',
      };

      Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
    }

    handle(message, ...args) {
      this.view.handle(message, ...args);
    }

    pan(x, y, dx, dy) {
      const mreport = new WamsShared.MouseReporter({ x, y, dx, dy });
      new Message(Message.DRAG, mreport).emitWith(this.socket);
    }

    resize() {
      this.resizeCanvasToFillWindow();
      this.view.draw();
      new Message(Message.RESIZE, this.view).emitWith(this.socket);
    }

    resizeCanvasToFillWindow() {
      this.view.resizeToFillWindow();
      this.canvas.width = window.innerWidth; 
      this.canvas.height = window.innerHeight;
    }

    setup(data) {
      locals.STAMPER.cloneId(this, data.id);
      this.canvas.style.backgroundColor = data.color;
      this.view.setup(data);
      new Message(Message.LAYOUT, this.view).emitWith(this.socket);
    }

    rotate(radians) {
      const rreport = new WamsShared.RotateReporter({ radians });
      new Message(Message.ROTATE, rreport).emitWith(this.socket);
    }

    tap(x, y) {
      const mreport = new WamsShared.MouseReporter({ x, y });
      new Message(Message.CLICK, mreport).emitWith(this.socket);
    }

    zoom(diff) {
      const scale = this.view.scale + diff;
      const sreport = new WamsShared.ScaleReporter({ scale });
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
  exports.ShadowView = ShadowView;
  exports.ClientItem = ClientItem;
  exports.ClientView = ClientView;
  exports.ClientController = ClientController;
}

