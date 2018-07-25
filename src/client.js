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
let io, WamsShared;
if (typeof require === 'function') {
  io = require('socket.io-client');
  WamsShared = require('../src/shared.js');
}

/*
 * Shorthand for the shared set of constants between server and client.
 */
const globals = Object.freeze(WamsShared.constants);

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
        return img;
      }
      return null;
    }
  });

  class ClientItem extends WamsShared.Item {
    constructor(data = {}) {
      super(data);
      if (data.hasOwnProperty('id')) locals.STAMPER.stamp(this, data.id);
      this.img = locals.createImage(this.imgsrc);
    }

    draw(context) {
      const width = this.width || this.img.width;
      const height = this.height || this.img.height;

      if (this.imgsrc) {
        context.drawImage(this.img, this.x, this.y, width, height);
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

const ClientController = (function defineClientController() {
  const locals = Object.freeze({
    HAMMER_EVENTS: [
      'tap',
      'dragstart',
      'drag',
      'dragend',
      'transformstart',
      'transform',
      'transformend',
    ],
    STAMPER: new WamsShared.IDStamper(),
  });

  class ClientController { 
    constructor(canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext('2d');
      this.drawInterval = null;
      this.hammer = null;
      this.mouse  = { x: 0, y: 0 };
      this.socket = null;
      this.startScale = null;
      this.transforming = false;
      this.viewer = new ClientViewer();

      establishHammer.call(this);
      establishSocket.call(this);
      attachWindowListeners.call(this);

      function attachWindowListeners() {
        const scroll_fn = this.scroll.bind(this); // To reuse bound function
        window.addEventListener('DOMMouseScroll', scroll_fn, false);
        window.addEventListener('mousewheel', scroll_fn, false);
        window.addEventListener('resize', this.resize.bind(this), false);
      }

      function establishHammer() {
        this.hammer = new Hammer(this.canvas);
        this.hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
        this.hammer.get('pinch').set({ enable: true });
        locals.HAMMER_EVENTS.forEach( e => {
          this.hammer.on(e, (event) => event.preventDefault() );
          this.hammer.on(e, this[e].bind(this));
        });
      }

      function establishSocket() {
        this.socket = io();
        this.socket.on(globals.MSG_INIT, (data) => {
          this.viewer.setup(data);
          locals.STAMPER.stamp(this, data.id);
          this.socket.emit(globals.MSG_LAYOUT, this.viewer.report());
        });
        this.socket.on(globals.MSG_UD_VIEW,
          this.viewer.updateViewer.bind(this.viewer)
        );
        this.socket.on(globals.MSG_RM_VIEW,
          this.viewer.removeViewer.bind(this.viewer)
        );
        this.socket.on(globals.MSG_UD_ITEMS,
          this.viewer.updateItems.bind(this.viewer)
        );
      }
    }

    drag(event) {
      if (this.transforming) { return; }

      const lastMouse = this.mouse;
      this.mouse = this.getMouseCoordinates(event);

      this.socket.emit(globals.MSG_DRAG, 
        this, 
        this.mouse.x,
        this.mouse.y,
        (lastMouse.x - this.mouse.x), 
        (lastMouse.y - this.mouse.y)
      );
    }

    dragend(event) {
      /*
       * NOP for now, here for consistency though.
       */
    }

    dragstart(event) {
      this.mouse = this.getMouseCoordinates(event);
    }

    getMouseCoordinates(event) {
      const base = {
        x: event.center.x / this.scale + this.x,
        y: event.center.y / this.scale + this.y,
      };
      const center = {
        x: (this.effectiveWidth / 2) + this.x,
        y: (this.effectiveHeight / 2) + this.y,
      };
      const coords = { x: -1, y: -1, };

      /*
       * XXX: Still need to figure out the "why" of this math. Once I've 
       *    done that, I will write up a comment explaining it.
       *
       *    Also, I think I'll refactor this into functional style.
       */
      switch (this.rotation) {
        case(globals.ROTATE_0): 
          coords.x = base.x;
          coords.y = base.y;
          break;
        case(globals.ROTATE_90): 
          coords.x = (2 * this.x) + this.effectiveWidth - base.x;
          coords.y = (2 * this.y) + this.effectiveHeight - base.y;
          break;
        case(globals.ROTATE_180):
          coords.x = center.x - center.y + base.y;
          coords.y = center.y + center.x - base.x;
          break;
        case(globals.ROTATE_270): 
          coords.x = center.x + center.y - base.y;
          coords.y = center.y - center.x + base.x;
          break;
      }

      return coords;
    }

    resize() {
      this.viewer.resize();
      this.canvas.width = window.innerWidth; 
      this.canvas.height = window.innerHeight;
    }

    run() {
      window.clearInterval(this.drawInterval);
      this.drawInterval = window.setInterval(
        () => this.viewer.draw(this.context),
        locals.FRAMERATE
      );
    }

    scroll(event) {
      /*
       * XXX: Let's have a close look at this. With no comments, I'm not 
       *    sure why a Math.max(Math.min()) structure is necessary. We 
       *    might be able to simplify this.
       */
      const delta = Math.max(
        -1, 
        Math.min( 1, (event.wheelDelta || -event.detail))
      );
      const newScale = this.scale + delta * 0.09;
      this.socket.emit(globals.MSG_SCALE, this.id, newScale);
    }

    sendUpdate() {
      this.socket.emit(globals.MSG_UPDATE, this.viewer.report());
    }

    tap(event) {
      this.mouse = this.getMouseCoordinates(event);
      this.socket.emit(
        globals.MSG_CLICK, 
        this.mouse.x,
        this.mouse.y
      );
    }

    transform(event) {
      this.socket.emit(
        globals.MSG_SCALE, 
        this.id, 
        event.scale * this.startScale
      );
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

const ClientViewer = (function defineClientViewer() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
      effectiveWidth: window.innerWidth,
      effectiveHeight: window.innerHeight,
      rotation: globals.ROTATE_0,
      scale: 1,
    }),
    FRAMERATE: 1000 / 60,
    STAMPER: new WamsShared.IDStamper(),

    removeByItemID(array, item) {
      const idx = array.findIndex( o => o.id === item.id );
      if (idx >= 0) {
        array.splice(idx, 1);
        return true;
      }
      return false;
    },
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
          .map( k => `${k}: ${this[k].toFixed(2)}`)
          .concat([`# of Shadows: ${this.shadows.length}`]);
        context.font = '18px Georgia';
        messages.forEach( m => {
          context.fillText(m, 10, base);
          base += 20;
        });
      }
    }

    removeItem(item) {
      locals.removeByItemID(this.items, item);
    }

    removeShadow(viewer) {
      locals.removeByItemID(this.shadows, viewer);
    }

    resizeToFillWindow() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.effectiveWidth = this.width / this.scale;
      this.effectiveHeight = this.height / this.scale;
    }

    setup(data) {
      locals.STAMPER.stamp(this, data.id);
      data.viewers.forEach( v => this.addShadow(v) );
      data.items.forEach( o => this.addItem(o) );
      this.canvas.style.backgroundColor = data.color;
    }

    updateItem(data) {
      const item = this.item.find( i => i.id === data.id );
      if (item) item.assign(data);
      else console.warn('Unable to find shadow to be updated.');
    }

    updateShadow(data) {
      const shadow = this.shadows.find( v => v.id === data.id );
      if (shadow) shadow.assign(data);
      else console.warn('Unable find shadow to be updated.');
    }
  }

  return ClientViewer;
})();

const ShadowViewer = (function defineShadowViewer() {
  const locals = Object.freeze({
    DEFAULTS: Object.freeze({
      x: 0,
      y: 0,
      effectiveWidth: window.innerWidth,
      effectiveHeight: window.innerHeight,
    }),
    STAMPER: new WamsShared.IDStamper(),
  });

  class ShadowViewer extends WamsShared.Viewer {
    constructor(values = {}) {
      super(WamsShared.initialize(locals.DEFAULTS, values));
      if (values.hasOwnProperty('id')) locals.STAMPER.stamp(this, values.id);
    }

    draw(context) {
      context.beginPath();
      context.rect(this.x, this.y, this.effectiveWidth, this.effectiveHeight);
      context.stroke();
    }
  }
  
  return ShadowViewer;
})();

// Entry point!
// window.addEventListener(
//   'load', 
//   function run() {
//     new ClientViewer().run();
//   },
//   {
//     capture: false,
//     once: true,
//     passive: true,
//   }
// );

if (typeof exports !== 'undefined') {
  exports.ClientViewer = ClientViewer;
  exports.ClientController = ClientController;
  exports.ClientItem = ClientItem;
  exports.ShadowViewer = ShadowViewer;
}

