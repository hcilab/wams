/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();


function polygon(x, y, view) {
  return WAMS.predefined.items.polygon(
    WAMS.predefined.utilities.randomPoints(7),   // random coordinates
    WAMS.colours[view.id % WAMS.colours.length], // random color
    {
      x,
      y,
      type:     'colour',
      scale:    1 / view.scale,
      onclick:  removeItem,
      onscale:  WAMS.predefined.scale,
      onrotate: WAMS.predefined.rotate,
      ondrag:   WAMS.predefined.drag,
    }
  );
}

function removeItem(event) {
  app.removeItem(event.target);
}

function spawnItem(event) {
  app.spawn(polygon(event.x, event.y, event.view));
}

function handleConnect(view) {
  view.onclick = spawnItem;
  view.onscale = WAMS.predefined.scale;
  view.onrotate = WAMS.predefined.rotate;
  view.ondrag = WAMS.predefined.drag;
}

app.onconnect(handleConnect);
app.listen(9014);

