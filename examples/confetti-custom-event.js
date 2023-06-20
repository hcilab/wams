/*
 * This is a simple example builds on the confetti.js example, which shows how users can interact with a shared set
 *  of items.
 *
 *  It demonstrates how an interaction effect (changing color during mouse down of a target item) can be achieved using custom events using a client script.
 */

'use strict';

const WAMS = require('..');
const path = require('path');
const app = new WAMS.Application();

// create a custom square
// with a random color
// with a centered location
// using CanvasSequence
function square(x, y, view, color) {
  const sequence = new WAMS.CanvasSequence();

  if (!color) sequence.fillStyle = WAMS.colours[view.id % WAMS.colours.length];
  else sequence.fillStyle = color;
  sequence.fillRect(-64, -64, 128, 128);
  const hitbox = new WAMS.Rectangle(128, 128, -64, -64);

  return {
    x,
    y,
    hitbox,
    sequence,
    type: 'item',
    scale: 1 / view.scale,
    rotation: view.rotation,
  };
}

function spawnSquare(x, y, view, color) {
  const item = app.spawn(square(x, y, view, color));
  // item.on('drag', WAMS.predefined.actions.drag);
  return item;
}

const squares = {};

function handleConnect({ view }) {
  view.on('pointerdown', lock);
  view.on('pointermove', move);
  view.on('pointerup', release);
}

function lock(event) {
  const item = app.workspace.findItemByCoordinates(event.x, event.y);
  if (item) {
    if (Object.values(squares).includes(item)) {
      return;
    }
    app.removeItem(item);
  }
  const newItem = spawnSquare(event.x, event.y, event.view, '#FFBF00');
  squares[event.pointerId] = newItem;
}

function move(event) {
  const item = squares[event.pointerId];
  if (item) {
    item.moveTo(event.x, event.y);
  }
}

function release(event) {
  const item = squares[event.pointerId];
  if (item) {
    app.removeItem(item);
    spawnSquare(event.x, event.y, event.view);
    delete squares[event.pointerId];
  }
}

app.on('connect', handleConnect);
app.listen(9000);
