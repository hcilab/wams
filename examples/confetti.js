/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function square(x, y, view) {
  const sequence = new Wams.CanvasSequence();
  sequence.fillStyle = Wams.colours[view.id % Wams.colours.length];
  sequence.fillRect(-64, -64, 128, 128);

  return {
    x, y,
    sequence,
    type:     'colour',
    scale:    1 / view.scale,
    rotation: view.rotation,
  };
}

function spawnSquare(event) {
  app.spawnItem(square(event.x, event.y, event.view));
}

function handleLayout(view) {
  view.onscale = Wams.predefined.scale;
  view.ondrag = Wams.predefined.drag;
  view.onrotate = Wams.predefined.rotate;
  view.onclick = spawnSquare;
}

app.onlayout(handleLayout);
app.listen(9002);

