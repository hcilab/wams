/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ShadowView class exposes a simple draw() function which renders a
 * shadowy outline of the view onto the canvas.
 */

/*
 * SOME NOTES ABOUT CANVAS RENDERING:
 *  - Avoid using shadows. They appear to kill the framerate.
 */

'use strict';

const { constants, IdStamper, View } = require('../shared.js');

const STAMPER = new IdStamper();
const COLOURS = [
  'saddlebrown',
  'red',
  'blue',
  'darkgreen',
  'orangered',
  'purple',
  'aqua',
  'lime',
];

const symbols = Object.freeze({
  align:    Symbol('align'),
  style:    Symbol('style'),
  outline:  Symbol('outline'),
  marker:   Symbol('marker'),
});

class ShadowView extends View {
  constructor(values) {
    super(values);
    STAMPER.cloneId(this, values.id);
  }

  draw(context) {
    /*
     * WARNING: It is *crucial* that this series of instructions be wrapped in
     * save() and restore().
     */
    context.save();
    this[symbols.align]   (context);
    this[symbols.style]   (context);
    this[symbols.outline] (context);
    this[symbols.marker]  (context);
    context.restore();
  }

  [symbols.align](context) {
    context.translate(this.x,this.y);
    context.rotate(constants.ROTATE_360 - this.rotation);
  }

  [symbols.style](context) {
    context.globalAlpha = 0.5;
    context.strokeStyle = COLOURS[this.id % COLOURS.length];
    context.fillStyle = context.strokeStyle;
    context.lineWidth = 5;
  }

  [symbols.outline](context) {
    context.strokeRect( 0, 0, this.effectiveWidth, this.effectiveHeight);
  }

  [symbols.marker](context) {
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

module.exports = ShadowView;

