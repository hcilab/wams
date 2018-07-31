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
// let io, WamsShared;
// if (typeof require === 'function') {
//   io = require('socket.io-client');
//   WamsShared = require('../src/shared.js');
// }

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
      if (values.hasOwnProperty('id')) locals.STAMPER.stamp(this, values.id);
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
        img.onload = () => img.loaded = true;
        return img;
      }
      return null;
    }
  });

  class ClientItem extends WamsShared.Item {
    constructor(data) {
      super(data);
      if (data.hasOwnProperty('id')) locals.STAMPER.stamp(this, data.id);
      else throw 'Items require IDs, but not ID found.';
      this.img = locals.createImage(this.imgsrc);
    }

    draw(context) {
      const width = this.width || this.img.width;
      const height = this.height || this.img.height;

      if (this.img) {
        if (this.img.loaded) {
          context.drawImage(this.img, this.x, this.y, width, height);
        } else {
          context.fileStyle = '#252525';
          context.fillRect(this.x, this.y, width, height);
        }
      } else {
        /*
         * XXX: Yikes!!! eval()? And we want this to be a usable 
         *    API? For people to work together over networks? 
         *    Pardon my French, but how the f*** are we going to 
         *    make sure that no one is injecting malicious code 
         *    here? 
         *
         *    Where is draw defined, and how does it end up here?
         *
         *    There must be a better way...
         *
         *    + Answer: I believe there is! Check out the canvas
         *      sequencer library I'm working on!
         */
        // eval(`${this.drawCustom};`);
        // eval(`${this.drawStart};`);
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
    FRAMERATE: 1000 / 60,
    STAMPER: new WamsShared.IDStamper(),
  });

  class ClientViewer extends WamsShared.Viewer {
    constructor(values) {
      super(WamsShared.initialize(locals.DEFAULTS, values));
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

    draw(context) {
      context.save();
      wipeAndReposition.call(this, context);
      locate.call(this, context);
      this.items.forEach( o => o.draw(context) );
      this.shadows.forEach( v => v.draw(context) );
      showStatus.call(this, context);
      context.restore();

      function wipeAndReposition(context) {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.scale(this.scale, this.scale);
        context.translate(-this.x, -this.y);
        context.rotate(this.rotation);
      }

      function locate(context) {
        switch(this.rotation) {
          case(globals.ROTATE_0): 
            break;
          case(globals.ROTATE_90): 
            context.translate(
              (-this.effectiveWidth - (this.x * 2)), 
              (-this.effectiveHeight - (this.y * 2))
            ); 
            break;
          case(globals.ROTATE_180): 
            context.translate(
              -this.effectiveWidth, 
              -(this.x * 2)
            ); 
            break;
          case(globals.ROTATE_270): 
            context.translate(
              -(this.y * 2), 
              -this.effectiveWidth
            ); 
            break;
        }
      }

      function showStatus(context) {
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
        context.font = '18px Georgia';
        messages.forEach( m => {
          context.fillText(m, 20, base);
          base += 20;
        });
      }
    }

    handle(message, ...args) {
      this[message](...args);
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
      locals.STAMPER.stamp(this, data.id);
      data.viewers.forEach( v => v.id !== this.id && this.addShadow(v) );
      data.items.forEach( o => this.addItem(o) );
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
    getScale() {
      return window.devicePixelRatio.toFixed(2);
    }
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
      this.dragging = false;
      this.zoom = locals.getScale();

      this.resizeCanvasToFillWindow();
      attachWindowListeners.call(this);
      establishInteraction.call(this);
      establishSocket.call(this);

      function attachWindowListeners() {
        // const scroll_fn = this.scroll.bind(this); // To reuse bound function
        // window.addEventListener('DOMMouseScroll', scroll_fn, false);
        // window.addEventListener('mousewheel', scroll_fn, false);
        window.addEventListener('resize', this.resize.bind(this), false);
      }

      function establishInteraction() {
        this.canvas.onpointermove = this.pointermove.bind(this);
        this.canvas.onpointerup = this.pointerup.bind(this);
        window.onwheel = this.dozoom.bind(this);
      }

      function establishSocket() {
        this.socket = io.connect(`${window.origin}${globals.NS_WAMS}`, {
          autoConnect: false,
          reconnection: false,
        });
        this[symbols.attach_listeners]();
        this.socket.connect();
      }
    }

    [symbols.attach_listeners]() {
      const listeners = {
        // For the server to inform about changes to the model
        [Message.ADD_ITEM]:   (...args) => this.viewer.addItem(...args),
        [Message.ADD_SHADOW]: (...args) => this.viewer.addShadow(...args),
        [Message.RM_ITEM]:    (...args) => this.viewer.removeItem(...args),
        [Message.RM_SHADOW]:  (...args) => this.viewer.removeShadow(...args),
        [Message.UD_ITEM]:    (...args) => this.viewer.updateItem(...args),
        [Message.UD_SHADOW]:  (...args) => this.viewer.updateShadow(...args),
        [Message.UD_VIEWER]:  (...args) => this.viewer.assign(...args),

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

    dozoom() {
      // const zoom = locals.getScale();
      // if (String(zoom) !== String(this.zoom)) {
      //   const sreport = new WamsShared.ScaleReporter({scale:zoom});
      //   new Message(Message.SCALE, sreport).emitWith(this.socket);
      // }
    }

    pointerup(event) {
      event.preventDefault();
      if (this.dragging) {
        this.dragging = false;
        return;
      }
      const mreport = new WamsShared.MouseReporter({
        x: event.clientX + this.viewer.x,
        y: event.clientY + this.viewer.y,
      });
      new Message(Message.CLICK, mreport).emitWith(this.socket);
    }

    pointermove(event) {
      if (event.pressure <= 0) return;
      event.preventDefault();
      this.dragging = true;
      
      this.dozoom();

      const mreport = new WamsShared.MouseReporter({
        x: event.clientX + this.viewer.x,
        y: event.clientY + this.viewer.y,
        dx: event.movementX,
        dy: event.movementY,
      });
      new Message(Message.DRAG, mreport).emitWith(this.socket);
    }

    pan(event) {
      if (this.transforming) { return; }
      const mreport = new WamsShared.MouseReporter({
        x: event.center.x,
        y: event.center.y,
        dx: event.deltaX,
        dy: event.deltaY,
      });
      console.log(mreport.report());
      new Message(Message.DRAG, mreport).emitWith(this.socket);
    }

    panleft(e) { this.pan(e); }
    panright(e) { this.pan(e); }
    panup(e) { this.pan(e); }
    pandown(e) { this.pan(e); }

    panend(event) {
      /*
       * NOP for now, here for consistency though.
       */
    }

    panstart({center}) {
      this.mouse = this.viewer.getMouseCoordinates(center.x, center.y);
    }

    resize() {
      this.viewer.resizeToFillWindow();
      this.resizeCanvasToFillWindow();
      new Message(Message.RESIZE, this.viewer).emitWith(this.socket);
    }

    run() {
      window.clearInterval(this.drawInterval);
      this.drawInterval = window.setInterval(
        () => this.viewer.draw(this.context),
        locals.FRAMERATE
      );
    }

    /*
     * XXX: Let's have a close look at this. With no comments, I'm not 
     *    sure why a Math.max(Math.min()) structure is necessary. We 
     *    might be able to simplify this.
     */
    // scroll(event) {
    //   const delta = Math.max(
    //     -1, 
    //     Math.min( 1, (event.wheelDelta || -event.detail))
    //   );
    //   const sreport = new WamsShared.ScaleReporter({
    //     scale: this.scale + delta * 0.09
    //   });
    //   new Message(Message.SCALE, sreport).emitWith(this.socket);
    // }

    resizeCanvasToFillWindow() {
      this.canvas.width = window.innerWidth; 
      this.canvas.height = window.innerHeight;
    }

    setup(data) {
      locals.STAMPER.stamp(this, data.id);
      this.viewer.setup(data);
      this.canvas.style.backgroundColor = data.color;
      new Message(Message.LAYOUT, this.viewer).emitWith(this.socket);
    }

    tap({center}) {
      this.mouse = this.viewer.getMouseCoordinates(center.x, center.y);
      const mreport = new WamsShared.MouseReporter({
        x: this.mouse.x,
        y: this.mouse.y,
      });
      new Message(Message.CLICK, mreport).emitWith(this.socket);
    }

    transform(event) {
      const sreport = new WamsShared.ScaleReporter({
        scale: event.scale * this.startScale
      });
      new Message(Message.SCALE, sreport).emitWith(this.socket);
    }

    transformend(event) {
      this.transforming = false;
      this.startScale = null;
    }

    transformstart(event) {
      this.transforming = true;
      this.startScale = this.viewer.scale;
    }
  }

  return ClientController;
})();

// Entry point!
window.addEventListener(
  'load', 
  function run() {
    new ClientController(document.querySelector('canvas')).run();
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

