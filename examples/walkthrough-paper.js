const WAMS = require('..');
const app = new WAMS.Application({ useMultiScreenGestures: true });

const { square } = WAMS.predefined.items;
const { line } = WAMS.predefined.layouts;

function spawnSquare(event) {
  app.spawn(
    square(event.x - 50, event.y - 50, 100, 'green', {
      allowDrag: true,
      allowRotate: true,
      allowScale: true,
    })
  );
}

const linelayout = line();
function handleConnect(view, device) {
  view.onclick = spawnSquare;
  linelayout(view, device);
}

app.onconnect(handleConnect);
app.listen(3600);
