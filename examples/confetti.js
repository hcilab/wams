/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();

function spawnSquare(event) {
  const { x, y, view } = event;
  app.spawn(WAMS.predefined.items.square(128, WAMS.colours[view.id % WAMS.colours.length], {
    x,
    y,
    scale: 1 / view.scale,
    rotation: view.rotation,
  }));
}

function handleConnect({ view }) {
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('drag', WAMS.predefined.actions.drag);
  view.on('rotate', WAMS.predefined.actions.rotate);
  view.on('click', spawnSquare);
}

app.on('connect', handleConnect);
app.listen(9000);
