const path = require('path');

const WAMS = require('..');
const { image } = WAMS.predefined.items;

const TOTAL_WIDTH = 5650;
const TOTAL_HEIGHT = 6053;

const app = new WAMS.Application({
  shadows: true,
  /*
   * Mult-screen gestures are currently incomplatible with targetting different
   * drag events at different screens- all screens/views move together.
   */
  useMultiScreenGestures: true,
});
app.addStaticDirectory(path.join(__dirname, 'img'));

app.on('position', (data) => {
  console.log(data);
  // x and y are floats from 0 to 1, representing relative
  // position of the tracker in space on each dimension
  const { x, y } = data.position;
  const trackedView = app.viewspace.views[data.deviceIndex];
  if (trackedView) {
    trackedView.moveTo(x * TOTAL_WIDTH, y * TOTAL_HEIGHT);
  }
});

app.spawn(
  image('map.jpg', {
    width: 5650,
    height: 6053,
    x: 0,
    y: 0,
  })
);

const viewGroup = app.createViewGroup();
viewGroup.scaleBy(1.7);
viewGroup.on('drag', WAMS.predefined.actions.drag);

function viewSetup({ view, device }) {
  if (view.index === 0) {
    view.scaleBy(0.6);
  } else if (view.index === 1) {
    // With multi-device gestures, views are currently acted on as a group.
    view.group.on('drag', WAMS.predefined.actions.drag);
    view.scaleBy(3.4);
    view.moveTo(1615, 2800);
  } else {
    view.scaleBy(1.7);
    // Connect all the rest of the views into one view group!
    // - Multi-device gestures still won't work properly as the devices are
    // layered on top of each other. The layouts currently don't support
    // anything less than one group for all views/devices.
    viewGroup.add(view);
  }
}

app.on('connect', viewSetup);
app.listen(9000);
