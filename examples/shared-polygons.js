/*
 * This is a simple example showing how users
 * can interact with the same items on different screens.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  // useMultiScreenGestures: true, // enables multi-screen gestures
});

function polygon(x, y, view) {
  return WAMS.predefined.items.polygon(
    WAMS.predefined.utilities.randomPoints(7),
    WAMS.colours[Math.floor(Math.random() * WAMS.colours.length)],
    {
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale,
      onclick: removeItem,
      onpinch: WAMS.predefined.actions.pinch,
      onrotate: WAMS.predefined.actions.rotate,
      ondrag: WAMS.predefined.actions.drag,
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
const linelayout = WAMS.predefined.layouts.line(200);
function handleConnect({ view, device, group }) {
  group.onclick = spawnItem;
  group.onpinch = WAMS.predefined.actions.pinch;
  group.onrotate = WAMS.predefined.actions.rotate;
  group.ondrag = WAMS.predefined.actions.drag;
  linelayout(view, device);
}

app.onconnect(handleConnect);
app.listen(9500);
