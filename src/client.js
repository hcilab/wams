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
 * FIXME: This is ugly!! This code will not work on the actual client if this
 *  test code is left in!
 */
// const io = require('socket.io-client');
// const WamsShared = require('../src/shared.js');
// const ZingTouch = require('../libs/zingtouch.js');
// const cseq = require('../libs/canvas_sequencer.js');
// const Blueprint = cseq.Blueprint;

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
      else throw 'Shadows require IDs, but no ID found.';
    }

    draw(context) {
      context.beginPath();
      context.rect(this.x, this.y, this.effectiveWidth, this.effectiveHeight);
      context.stroke();
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
      else throw 'Items require IDs, but no ID found.';
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

      if (this.img) {
        if (this.img.loaded) {
          context.drawImage(this.img, this.x, this.y, width, height);
        } else {
          context.fillStyle = '#252525';
          context.fillRect(this.x, this.y, width, height);
        }
      } else if (this.sequence) {
        this.sequence.execute(context);
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
      'context',
    ]),
    FRAMERATE: 1000 / 60,
    STAMPER: new WamsShared.IDStamper(),
  });

  class ClientViewer extends WamsShared.Viewer {
    constructor(values) {
      super(WamsShared.getInitialValues(locals.DEFAULTS, values));
      this.items = [];
      this.shadows = [];
      this.resizeToFillWindow();
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
      locate.call(this);
      this.items.forEach( o => o.draw(this.context) );
      this.shadows.forEach( v => v.draw(this.context) );
      showStatus.call(this);
      this.context.restore();

      function wipeAndReposition() {
        this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        this.context.scale(this.scale, this.scale);
        this.context.translate(-this.x, -this.y);
        this.context.rotate(this.rotation);
      }

      function locate() {
        switch(this.rotation) {
          case(globals.ROTATE_0): 
            break;
          case(globals.ROTATE_90): 
            this.context.translate(
              (-this.effectiveWidth - (this.x * 2)), 
              (-this.effectiveHeight - (this.y * 2))
            ); 
            break;
          case(globals.ROTATE_180): 
            this.context.translate(
              -this.effectiveWidth, 
              -(this.x * 2)
            ); 
            break;
          case(globals.ROTATE_270): 
            this.context.translate(
              -(this.y * 2), 
              -this.effectiveWidth
            ); 
            break;
        }
      }

      function showStatus() {
        let base = 40;
        const messages = Object.keys(locals.DEFAULTS)
          .map( k => {
            if (typeof this[k] === 'number') {
              return `${k}: ${this[k].toFixed(2)}`;
            } else {
              return `${k}: ${this[k]}`;
            }
          })
          .concat([`# of Shadows: ${this.shadows.length}`]);
        this.context.font = '18px Georgia';
        messages.forEach( m => {
          this.context.fillText(m, 20, base);
          base += 20;
        });
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
      this.context = data.context;
      this.draw();
      document.addEventListener(
        'wams-image-loaded',
        () => this.draw()
      );
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
      this.drawInterval = null;
      this.mouse  = { x: 0, y: 0 };
      this.socket = null;
      this.startScale = null;
      this.transforming = false;
      this.viewer = new ClientViewer();
      // this.dragging = false;
      // this.zoom = locals.getScale();

      this.resizeCanvasToFillWindow();
      attachWindowListeners.call(this);
      establishInteraction.call(this);
      establishSocket.call(this);

      function attachWindowListeners() {
        // const scroll_fn = this.scroll.bind(this); // To reuse bound function
        // window.addEventListener('DOMMouseScroll', scroll_fn, false);
        // window.addEventListener('mousewheel', scroll_fn, false);
        window.addEventListener('resize', this.resize.bind(this), false);
        window.addEventListener('wheel', this.wheel.bind(this), false);
      }

      function establishInteraction() {
        const region = ZingTouch.Region(this.canvas, true, true);

        // Hijack some custom functionality into the zingtouch pan.
        const customPan = new ZingTouch.Pan();
        const panMove = customPan.move;
        customPan.move = function(inputs, state, element) {
          const progress = inputs[0].getGestureProgress(this.getId());
          const movement = {
            x: inputs[0].current.x - progress.lastEmitted.x,  
            y: inputs[0].current.y - progress.lastEmitted.y,
          };
          const output = panMove.call(this, inputs, state, element);
          if (output) {
            output.data[0].movement = movement;
          }
          return output;
        }

        // Hijack some custom functionality into the zingtouch pinch and expand
        // gestures.
        const customPinch = new ZingTouch.Pinch();
        const pinchMove = customPinch.move;
        customPinch.move = function(inputs, state, element) {
          const progress = inputs[0].getGestureProgress(this.getId());
          const lastDistance = progress.lastEmittedDistance;
          const data = pinchMove.call(this, inputs, state, element);
          if (data) {
            data.change = data.distance - lastDistance;
          }
          return data;
        }

        const customExpand = new ZingTouch.Expand();
        const expandMove = customExpand.move;
        customExpand.move = function(inputs, state, element) {
          const progress = inputs[0].getGestureProgress(this.getId());
          const lastDistance = progress.lastEmittedDistance;
          const data = expandMove.call(this, inputs, state, element);
          if (data) {
            data.change = data.distance - lastDistance;
          }
          return data;
        }

        region.bind(this.canvas, 'tap', this.tap.bind(this));
        region.bind(this.canvas, customPan, this.pan.bind(this));
        region.bind(this.canvas, customPinch, this.pinchOrExpand.bind(this));
        region.bind(this.canvas, customExpand, this.pinchOrExpand.bind(this));
      }

      function establishSocket() {
        this.socket = io.connect(
          `${window.location.href.slice(0, -1)}${globals.NS_WAMS}`, 
          {
            autoConnect: false,
            reconnection: false,
          }
        );
        this[symbols.attach_listeners]();
        this.socket.connect();
      }
    }

    tap({detail}) {
      const event = detail.events[0];
      const mreport = new WamsShared.MouseReporter({
        x: event.clientX,
        y: event.clientY,
      });
      new Message(Message.CLICK, mreport).emitWith(this.socket);
    }

    pan({detail}) {
      const event = detail.events[0];
      const data = detail.data[0];
      const mreport = new WamsShared.MouseReporter({
        x: event.clientX,
        y: event.clientY,
        dx: data.movement.x,
        dy: data.movement.y,
      });
      this.prevX = event.clientX;
      this.prevY = event.clientY;
      new Message(Message.DRAG, mreport).emitWith(this.socket);
    }

    pinchOrExpand({detail}) {
      const sreport = new WamsShared.ScaleReporter({
        scale: this.viewer.scale + detail.change * 0.009
      });
      new Message(Message.SCALE, sreport).emitWith(this.socket);
    }

    wheel(event) {
      const sreport = new WamsShared.ScaleReporter({
        scale: this.viewer.scale - event.deltaY * 0.0025
      });
      new Message(Message.SCALE, sreport).emitWith(this.socket);
    }

    handle(message, ...args) {
      this.viewer.handle(message, ...args);
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
      };

      Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
    }

    resize() {
      this.viewer.resizeToFillWindow();
      this.resizeCanvasToFillWindow();
      this.viewer.draw();
      new Message(Message.RESIZE, this.viewer).emitWith(this.socket);
    }

    resizeCanvasToFillWindow() {
      this.canvas.width = window.innerWidth; 
      this.canvas.height = window.innerHeight;
    }

    setup(data) {
      locals.STAMPER.cloneId(this, data.id);
      data.context = this.context;
      this.viewer.setup(data);
      this.canvas.style.backgroundColor = data.color;
      new Message(Message.LAYOUT, this.viewer).emitWith(this.socket);
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

if (typeof exports !== 'undefined') {
  exports.ShadowViewer = ShadowViewer;
  exports.ClientItem = ClientItem;
  exports.ClientViewer = ClientViewer;
  exports.ClientController = ClientController;
}

