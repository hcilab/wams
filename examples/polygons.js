/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function polygon(x, y, view) {
  return Wams.predefined.items.polygon(
    Wams.predefined.utilities.randomPoints(7),
    Wams.colours[view.id % Wams.colours.length],
    {
      x,
      y,
      type:     'colour',
      scale:    1 / view.scale,
      onclick:  removeItem,
      onscale:  Wams.predefined.scale,
      onrotate: Wams.predefined.rotate,
      ondrag:   Wams.predefined.drag,
    }
  );
}

function removeItem(event) {
  app.removeItem(event.target);
}

function spawnItem(event) {
  app.spawnItem(polygon(event.x, event.y, event.view));
}

function handleConnect(view) {
  view.onclick = spawnItem;
  view.onscale = Wams.predefined.scale;
  view.onrotate = Wams.predefined.rotate;
  view.ondrag = Wams.predefined.drag;
}

app.onconnect(handleConnect);
app.listen(9014);

