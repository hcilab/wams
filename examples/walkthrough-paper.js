const WAMS = require('..');
const app = new WAMS.Application({
  shadows: true,
  status: true,
});

const { action, items, layouts } = WAMS.predefined;

function spawnSquare(event) {
  const item = app.spawn(items.square(100, 'green', { x: event.x, y: event.y }));
  item.on('drag', actions.drag);
  item.on('rotate', actions.rotate);
  item.on('pinch', actions.pinch);
  return item;
}

const viewGroup = app.createViewGroup();
viewGroup.on('click', spawnSquare);

const line = new layouts.LineLayout(0);
function handleConnect({ view, device }) {
  // Connect all the rest of the views into one view group! This has the effect
  // of making the views act as one view, including combining their inputs into
  // multi-device gestures!
  viewGroup.add(view);
  line.layout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
