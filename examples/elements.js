/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();

function element(x, y, view) {
  return WAMS.predefined.items.html('<button onclick="alert(\'You panicked :(\')">dont panic</button>', 300, 50, {
    x,
    y,
    width: 300,
    height: 50,
    type: 'item/element',
    scale: 1 / view.scale,
    rotation: view.rotation,
  });
}

function removeElement(event) {
  app.removeItem(event.target);
}

function spawnElement(event) {
  const item = app.spawn(element(event.x, event.y, event.view));
  item.on('pinch', WAMS.predefined.actions.pinch);
  item.on('drag', WAMS.predefined.actions.drag);
  item.on('rotate', WAMS.predefined.actions.rotate);
  item.on('click', removeElement);
}

function handleConnect({ view }) {
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('drag', WAMS.predefined.actions.drag);
  view.on('rotate', WAMS.predefined.actions.rotate);
  view.on('click', spawnElement);
}

app.on('connect', handleConnect);
app.listen(9000);
