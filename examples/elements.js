/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function element(x, y, view) {
  return Wams.predefined.items.wrappedElement(
    '<button onclick="alert(\'You panicked :\(\')">dont panic</button>',
    300,
    50,
    {
      x,
      y,
      width: 300,
      height: 50,
      type:  'button',
      scale: 1 / view.scale,
      rotation: view.rotation,
      onscale: Wams.predefined.scale,
      ondrag: Wams.predefined.drag,
      onrotate: Wams.predefined.rotate,
      onclick: removeElement,
    }
  );
}

function removeElement(event) {
  app.removeItem(event.target);
}

function spawnElement(event) {
  app.spawnElement(element(event.x, event.y, event.view));
}

function handleLayout(view) {
  view.onscale = Wams.predefined.scale;
  view.ondrag = Wams.predefined.drag;
  view.onrotate = Wams.predefined.rotate;
  view.onclick = spawnElement;
}

app.onlayout(handleLayout);
app.listen(9002);

