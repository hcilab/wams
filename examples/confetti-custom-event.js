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

function square(x, y, view, color) {}

function spawnSquare(event, color) {
  const { x, y, view } = event;
  const item = app.spawn(
    WAMS.predefined.items.square(128, color || WAMS.colours[view.id % WAMS.colours.length], {
      x,
      y,
      scale: 1 / view.scale,
      rotation: view.rotation,
    })
  );
  item.on('drag', WAMS.predefined.actions.drag);
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
