const WAMS = require('..');
const path = require('path');
const { image } = WAMS.predefined.items;
const { line } = WAMS.predefined.layouts;

const dimensions = [];
const deepSpace = { x: 99999, y: 99999 };

const app = new WAMS.Application({
  color: '#f4f4f4',
  shadows: true,
  staticDir: path.join(__dirname, '/img'),
});

spawnImage(200, 300);

app.on('deviceNearScreen', (data) => {
  const { deviceIndex, nearIndex } = data;
  console.log(`[Tracker] View ${deviceIndex} is close to ${nearIndex}`);
  const currentView = app.group.views[deviceIndex];
  const nearView = app.group.views[nearIndex];
  if (currentView) moveScreenToScreen(currentView, nearView);
});

app.on('deviceFarFromScreens', (data) => {
  const { deviceIndex } = data;
  console.log(`[Tracker] View ${deviceIndex} is far from screens`);
  const currentView = app.group.views[deviceIndex];
  if (currentView) moveScreenWithItems(currentView, deepSpace.x, deepSpace.y);
});

const setLayout = line(0);
function handleConnect({ view, device, group }) {
  if (view.index >= 2) {
    // send to deep space :)
    view.moveTo(deepSpace.x, deepSpace.y);
  } else {
    setLayout(view, device);
  }
  dimensions[view.index] = { x: device.x, y: device.y, width: device.width, height: device.height };
}

app.onconnect = handleConnect;
app.listen(9700);

function moveScreenToScreen(currentView, targetView) {
  const centeredBelowPosX = targetView.x + targetView.width / 2 - currentView.width / 2;
  const centeredBelowPosY = targetView.y + targetView.height - 100;
  moveScreenWithItems(currentView, centeredBelowPosX, centeredBelowPosY);
}

function moveScreenWithItems(currentView, targetX, targetY) {
  const deltaX = targetX - currentView.x;
  const deltaY = targetY - currentView.y;
  app.workspace.items.forEach((item) => {
    if (viewContainsItem(currentView, item)) {
      item.moveBy(deltaX, deltaY);
    }
  });
  currentView.moveBy(deltaX, deltaY);
}

function viewContainsItem(view, item) {
  const { width, height, x, y } = view;
  if (item.x >= x && item.x < x + width && item.y >= y && item.y < y + height) {
    return true;
  }
  return false;
}

function spawnImage(x, y) {
  return app.spawn(
    image('dribble.png', {
      ondrag: WAMS.predefined.actions.drag,
      onrotate: WAMS.predefined.actions.rotate,
      width: 1600,
      height: 1200,
      scale: 1 / 4,
      x,
      y,
    })
  );
}
