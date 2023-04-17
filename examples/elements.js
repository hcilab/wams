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
    type: 'button',
    scale: 1 / view.scale,
    rotation: view.rotation,
    allowScale: true,
    ondrag: WAMS.predefined.actions.drag,
    allowRotate: true,
    onclick: removeElement,
  });
}

function removeElement(event) {
  app.removeItem(event.target);
}

function spawnElement(event) {
  app.spawn(element(event.x, event.y, event.view));
}

function handleConnect(view) {
  view.allowScale = true;
  view.ondrag = WAMS.predefined.actions.drag;
  view.allowRotate = true;
  view.onclick = spawnElement;
}

app.onconnect(handleConnect);
app.listen(9002);
