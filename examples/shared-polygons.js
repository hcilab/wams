/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application({
  // clientLimit:       4,
  useServerGestures: true,
});

function polygon(x, y, view) {
  return Wams.predefined.items.polygon(
    Wams.predefined.utilities.randomPoints(7),
    Wams.colours[Math.floor(Math.random() * Wams.colours.length)],
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

const linelayout = Wams.predefined.layouts.line(5);
function handleConnect(view, index, device, group) {
  group.onclick = spawnItem;
  group.onscale = Wams.predefined.scale;
  group.onrotate = Wams.predefined.rotate;
  group.ondrag = Wams.predefined.drag;
  // view.onclick = spawnItem;
  // view.onscale = Wams.predefined.scale;
  // view.onrotate = Wams.predefined.rotate;
  // view.ondrag = Wams.predefined.drag;
  linelayout(view, index, device);
}

app.onlayout(handleConnect);
app.listen(9050);

