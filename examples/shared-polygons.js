/*
 * This is a simple example showing how users 
 * can interact with the same items on different screens.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  // clientLimit:       4,
  useServerGestures: true, // enables multi-screen gestures 
});

function polygon(x, y, view) {
  return WAMS.predefined.items.polygon(
    WAMS.predefined.utilities.randomPoints(7),
    WAMS.colours[Math.floor(Math.random() * WAMS.colours.length)],
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

// use predefined "line layout"
const linelayout = WAMS.predefined.layouts.line(5);
function handleConnect(view, device, group) {
  group.onclick = spawnItem;
  group.onscale = WAMS.predefined.scale;
  group.onrotate = WAMS.predefined.rotate;
  group.ondrag = WAMS.predefined.drag;
  linelayout(view, view.index, device);
}

app.onconnect(handleConnect);
app.listen(9500);

