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
    }
  );
}

function removeItem(event) {
  app.removeItem(event.target);
}

function spawnItem(event) {
  const item = app.spawn(polygon(event.x, event.y, event.view));
  item.on('click', removeItem);
  item.on('pinch', WAMS.predefined.actions.pinch);
  item.on('rotate', WAMS.predefined.actions.rotate);
  item.on('drag', WAMS.predefined.actions.drag);
}

// use predefined "line layout"
const linelayout = WAMS.predefined.layouts.line(200);
function handleConnect({ view, device, group }) {
  group.on('click', spawnItem);
  group.on('pinch', WAMS.predefined.actions.pinch);
  group.on('rotate', WAMS.predefined.actions.rotate);
  group.on('drag', WAMS.predefined.actions.drag);
  linelayout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
