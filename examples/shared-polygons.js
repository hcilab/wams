/*
 * This is a simple example showing how users 
 * can interact with the same items on different screens.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application({
  // clientLimit:       4,
  useServerGestures: true, // enables multi-screen gestures 
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
  app.spawn(polygon(event.x, event.y, event.view));
}

// use predefined "line layout"
const linelayout = Wams.predefined.layouts.line(5);
function handleConnect(view, device, group) {
  group.onclick = spawnItem;
  group.onscale = Wams.predefined.scale;
  group.onrotate = Wams.predefined.rotate;
  group.ondrag = Wams.predefined.drag;
  linelayout(view, view.index, device);
}

app.onconnect(handleConnect);
app.listen(9500);

