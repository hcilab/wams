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
  return app.spawn(WAMS.predefined.items.square(128, colour, { x, y, lockZ: true }));
}

const squares = {};

function handleConnect({ view }) {
  view.on('pointerdown', lock);
  view.on('pointermove', move);
  view.on('pointerup', release);
}

function lock({ x, y, pointerId }) {
  const item = app.workspace.findItemByCoordinates(x, y);
  if (item) {
    if (Object.values(squares).includes(item)) {
      return;
    }
    app.removeItem(item);
  }
  const newItem = spawnSquare(x, y, '#FFBF00');
  squares[pointerId] = newItem;
}

function move({ x, y, pointerId }) {
  const item = squares[pointerId];
  if (item) {
    item.moveTo(x, y);
  }
}

function release({ x, y, pointerId, view }) {
  const item = squares[pointerId];
  if (item) {
    app.removeItem(item);
    const colour = WAMS.colours[view.id % WAMS.colours.length];
    spawnSquare(x, y, colour);
    delete squares[pointerId];
  }
}

app.on('connect', handleConnect);
app.listen(9000);
