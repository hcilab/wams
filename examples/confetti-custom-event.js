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
    type: 'colour',
    scale: 1 / view.scale,
    rotation: view.rotation,
  };
}

function spawnSquare(event, color) {
  const item = app.spawn(square(event.x, event.y, event.view, color));
  item.on('drag', WAMS.predefined.actions.drag);
  return item;
}

function handleConnect({ view }) {
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('drag', WAMS.predefined.actions.drag);
  view.on('rotate', WAMS.predefined.actions.rotate);
  // view.on('click', spawnSquare);
  view.on('pointerdown', lock);
  view.on('pointerup', release);
}

function lock(event) {
  const item = app.workspace.findItemByCoordinates(event.x, event.y);
  if (item) {
    event.x = item.x;
    event.y = item.y;
    app.workspace.removeItem(item);
  }
  const newItem = spawnSquare(event, '#FFBF00');
  event.view.obtainLockOnItem(newItem);
}

function release(event) {
  const item = event.view.lockedItem;
  if (item) {
    event.x = item.x;
    event.y = item.y;
    app.workspace.removeItem(item);
  }
  spawnSquare(event);
}

app.on('connect', handleConnect);
app.listen(9000);
