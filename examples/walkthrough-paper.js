const WAMS = require('..');
const app = new WAMS.Application({
  useMultiScreenGestures: true,
  shadows: true,
  status: true,
});

const { square } = WAMS.predefined.items;
const { Line } = WAMS.predefined.layouts;

function spawnSquare(event) {
  const item = app.spawn(square(event.x - 50, event.y - 50, 100, 'green'));
  item.on('drag', WAMS.predefined.actions.drag);
  item.on('rotate', WAMS.predefined.actions.rotate);
  item.on('pinch', WAMS.predefined.actions.pinch);
  return item;
}

const viewGroup = app.createViewGroup();
viewGroup.on('click', spawnSquare);

const line = new Line(200);
function handleConnect({ view, device }) {
  viewGroup.add(view);
  line.layout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
