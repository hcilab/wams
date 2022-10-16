/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const path = require('path');
const app = new WAMS.Application({
    clientScripts: ['confetti-custom-event.js'],
    staticDir: path.join(__dirname, './client'),
});

// create a custom square
// with a random color
// with a centered location
// using CanvasSequence
function square(x, y, view, color) {
  const sequence = new WAMS.CanvasSequence();

  if (!color)
    sequence.fillStyle = WAMS.colours[view.id % WAMS.colours.length];
  else
    sequence.fillStyle = color;
  sequence.fillRect(-64, -64, 128, 128);
  const hitbox = new WAMS.Rectangle(128,128,-64, -64); 

  return {
    x,
    y,
    hitbox,
    sequence,
    type: 'colour',
    scale: 1 / view.scale,
    rotation: view.rotation,
    allowDrag: true
  };
}

function spawnSquare(event,color) {
  if (!color)
    app.spawn(square(event.x, event.y, event.view));
  else
    app.spawn(square(event.x, event.y, event.view,color));
}

function handleConnect(view) {
  view.allowScale = true;
  view.allowDrag = true;
  view.allowRotate = true;
  //view.onclick = spawnSquare;
}

app.on('mousedown', (event, view) => {

    let item = app.workspace.findItemByCoordinates(event.x, event.y);
    if (item)
    {
        event.x = item.x;
        event.y = item.y;
        app.workspace.removeItem(item);
    }

    event.view = view;
    spawnSquare(event, "#FFBF00");
});

app.on('mouseup', (event, view) => {

    let item = app.workspace.findItemByCoordinates(event.x, event.y);
    
    if (item)
    {
        event.x = item.x;
        event.y = item.y;
        app.workspace.removeItem(item);
    }

    event.view = view;
    spawnSquare(event);
});
app.onconnect(handleConnect);
app.listen(9013);
