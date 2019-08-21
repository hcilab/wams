/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { CanvasSequence } = require('canvas-sequencer');

/**
 * Transformation actions for items.
 *
 * @namespace actions
 * @memberof module:predefined
 */

function draw(event, workspace) {
  const fromX = event.x - event.dx;
  const fromY = event.y - event.dy;
  const toX = event.x;
  const toY = event.y;
  const line = new CanvasSequence();

  // line.beginPath()
  // line.moveTo(fromX, fromY);
  // line.lineTo(toX, toY);
  // line.strokeStyle = 'blue';
  // line.stroke();
  
  line.beginPath()
  line.fillStyle = 'blue'
  line.ellipse(toX, toY, 20, 20, Math.PI / 2, 0, 2 * Math.PI)
  line.fill()
  workspace.spawnItem({ sequence: line })
}

/**
 * Drags the group or target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function drag(event) {
  const item = event.target.parent || event.target;
  item.moveBy(event.dx, event.dy);
}

/**
 * Rotates the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function rotate(event) {
  event.target.rotateBy(event.rotation, event.x, event.y);
}

/**
 * Scales the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function scale(event) {
  event.target.scaleBy(event.scale, event.x, event.y);
}

module.exports = Object.freeze({
  draw,
  drag,
  rotate,
  scale,
});
