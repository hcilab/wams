/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ClientView class is used for all rendering activities on the client
 * side. This is essentially the view in an MVC-esque design.
 */

'use strict';

const ClientItem = require('./ClientItem.js');
const ShadowView = require('./ShadowView.js');
const { 
  constants: globals,
  getInitialValues, 
  safeRemoveById,
  IdStamper, 
  View 
} = require('../shared.js');

const DEFAULTS = Object.freeze({
  x: 0,
  y: 0,
  rotation: globals.ROTATE_0,
  scale: 1,
  type: 'view/background',
});

const STATUS_KEYS = Object.freeze([
  'x',
  'y',
  'width',
  'height',
  'effectiveWidth',
  'effectiveHeight',
  'rotation',
  'scale',
]);

const REQUIRED_DATA = Object.freeze([
  'id',
  'items',
  'views',
]);

const STAMPER = new IdStamper();

const symbols = Object.freeze({
  align: Symbol('align'),
  drawItems: Symbol('drawItems'),
  drawShadows: Symbol('drawShadows'),
  drawStatus: Symbol('drawStatus'),
  wipe: Symbol('wipe'),
});

class ClientView extends View {
  constructor(values = {}) {
    super(getInitialValues(DEFAULTS, values));

    if (values.context) this.context = values.context;
    else throw 'ClientView requires a CanvasRenderingContext2D!';

    this.items = [];
    this.shadows = [];
    document.addEventListener( 'wams-image-loaded', () => this.draw() );
  }

  [symbols.align]() {
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    this.context.scale(this.scale, this.scale);
    this.context.rotate(this.rotation);
    this.context.translate(-this.x, -this.y);
  }
  
  [symbols.drawItems]() {
    this.items.forEach( o => o.draw(this.context) );
  }

  [symbols.drawShadows]() {
    this.shadows.forEach( v => v.draw(this.context) );
  }

  [symbols.drawStatus]() {
    const messages = STATUS_KEYS
      .map( k => `${k}: ${this[k].toFixed(2)}` )
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

  [symbols.wipe]() {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  addItem(values) {
    this.items.push(new ClientItem(values));
  }

  addShadow(values) {
    this.shadows.push(new ShadowView(values));
  }

  draw() {
    this.context.save();
    this[symbols.wipe]();
    this[symbols.align]();
    this[symbols.drawItems]();
    this[symbols.drawShadows]();
    this[symbols.drawStatus]();
    this.context.restore();
  }

  handle(message, ...args) {
    this[message](...args);
    this.draw();
  }

  removeItem(item) {
    return safeRemoveById( this.items, item, ClientItem );
  }

  removeShadow(shadow) {
    return safeRemoveById( this.shadows, shadow, ShadowView );
  }

  resizeToFillWindow() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.effectiveWidth = this.width / this.scale;
    this.effectiveHeight = this.height / this.scale;
  }

  setup(data) {
    REQUIRED_DATA.forEach( d => {
      if (!data.hasOwnProperty(d)) throw `setup requires: ${d}`;
    });
    STAMPER.cloneId(this, data.id);
    data.views.forEach( v => v.id !== this.id && this.addShadow(v) );
    data.items.forEach( o => this.addItem(o) );
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

module.exports = ClientView;

