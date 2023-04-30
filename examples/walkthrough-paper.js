const WAMS = require('..');
const app = new WAMS.Application({ useMultiScreenGestures: true });

const { square } = WAMS.predefined.items;
const { line } = WAMS.predefined.layouts;

function spawnSquare(event) {
  const item = app.spawn(square(event.x - 50, event.y - 50, 100, 'green'));
  item.on('drag', WAMS.predefined.actions.drag);
  item.on('rotate', WAMS.predefined.actions.rotate);
  item.on('pinch', WAMS.predefined.actions.pinch);
  return item;
}

const linelayout = line();
function handleConnect({ view, device }) {
  view.on('click', spawnSquare);
  linelayout(view, device);
}

app.on('connect', handleConnect);
app.listen(9000);
