/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();

// create a custom square
// with a random color
// with a centered location
// using CanvasSequence
function square(x, y, view) {
  const sequence = new WAMS.CanvasSequence();
  sequence.fillStyle = WAMS.colours[view.id % WAMS.colours.length];
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
  app.spawn(square(event.x, event.y, event.view));
}

function handleConnect(view) {
  view.allowScale = true;
  view.allowDrag = true;
  view.allowRotate = true;
  view.onclick = spawnSquare;
}

app.onconnect(handleConnect);
app.listen(9013);

