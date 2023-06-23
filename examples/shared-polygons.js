/*
 * This is a simple example showing how users
 * can interact with the same items on different screens.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  color: '#dad1e3',
  title: 'Shared Polygons | WAMS',
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
      type: 'item',
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

const viewGroup = app.createViewGroup();
viewGroup.on('click', spawnItem);
viewGroup.on('pinch', WAMS.predefined.actions.pinch);
viewGroup.on('rotate', WAMS.predefined.actions.rotate);
viewGroup.on('drag', WAMS.predefined.actions.drag);

const line = new WAMS.predefined.layouts.LineLayout(0);
function handleConnect({ view, device }) {
  // Connect all the rest of the views into one view group! This has the effect
  // of making the views act as one view, including combining their inputs into
  // multi-device gestures!
  viewGroup.add(view);
  line.layout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
