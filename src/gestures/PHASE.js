'use strict';

/**
 * Normalizes window events to the phases start, move, end, or cancel.
 *
 * @memberof module:gestures
 * @enum {string}
 */
const PHASE = Object.freeze({
  mousedown: 'start',
  touchstart: 'start',
  pointerdown: 'start',

  mousemove: 'move',
  touchmove: 'move',
  pointermove: 'move',

  mouseup: 'end',
  touchend: 'end',
  pointerup: 'end',

  touchcancel: 'cancel',
  pointercancel: 'cancel',
});

module.exports = PHASE;
