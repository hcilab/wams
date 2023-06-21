/*
 * This is a simple example builds on the confetti.js example, which shows how
 *  users can interact with a shared set of items.
 *
 * It demonstrates how an interaction effect (changing colour during mouse down
 *  of a target item) can be achieved using raw pointer events.
 */

'use strict';

const WAMS = require('..');
const path = require('path');
const app = new WAMS.Application();

function spawnSquare(x, y, colour) {
  return app.spawn(WAMS.predefined.items.square(128, colour, { x, y }));
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
  const newItem = spawnSquare(event.x, event.y, '#FFBF00');
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
  const view = event.source;
  if (item) {
    app.removeItem(item);
    const colour = WAMS.colours[view.id % WAMS.colours.length];
    spawnSquare(event.x, event.y, colour);
    delete squares[event.pointerId];
  }
}

app.on('connect', handleConnect);
app.listen(9000);
