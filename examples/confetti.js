/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function square(x, y, view) {
  return Wams.predefined.items.square(
    -64, -64, 128,
    Wams.colours[view.id % Wams.colours.length],
    {
      x,
      y,
      type:     'colour',
      scale:    1 / view.scale,
      rotation: view.rotation,
      onclick:  removeSquare,
    }
  );
}

function spawnSquare(event) {
  app.spawnItem(square(event.x, event.y, event.view));
}

function removeSquare(event) {
  app.removeItem(event.target);
}

function handleLayout(view) {
  view.onscale = Wams.predefined.scale;
  view.ondrag = Wams.predefined.drag;
  view.onrotate = Wams.predefined.rotate;
  view.onclick = spawnSquare;
}

app.onlayout(handleLayout);
app.listen(9002);

