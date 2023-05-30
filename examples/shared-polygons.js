/*
 * This is a simple example showing how users
 * can interact with the same items on different screens.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  useMultiScreenGestures: true, // enables multi-screen gestures
  shadows: true,
  status: true,
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

const viewGroup = app.switchboard.group;
viewGroup.on('click', spawnItem);
viewGroup.on('pinch', WAMS.predefined.actions.pinch);
viewGroup.on('rotate', WAMS.predefined.actions.rotate);
viewGroup.on('drag', WAMS.predefined.actions.drag);

const line = new WAMS.predefined.layouts.Line(200);
function handleConnect({ view, device }) {
  line.layout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
