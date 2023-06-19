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

const lineLayout = new WAMS.predefined.layouts.LineLayout(5);
const viewGroup = app.createViewGroup();
viewGroup.scaleBy(1.7);
viewGroup.on('drag', WAMS.predefined.actions.drag);
viewGroup.on('pinch', WAMS.predefined.actions.pinch);
viewGroup.on('rotate', WAMS.predefined.actions.rotate);

function viewSetup({ view, device }) {
  if (view.index === 0) {
    view.scaleBy(0.6);
  } else if (view.index === 1) {
    // With multi-device gestures, views are currently acted on as a group.
    view.group.on('drag', WAMS.predefined.actions.drag);
    // This only works because when views are created they are created with a
    // new group, so we know we are not adding any other views to this group,
    // and that we are not applying this scale multiple times to the same
    // group, even if a view is disconnected and reconnected.
    view.group.scaleBy(3.4);
    view.moveTo(1615, 2800);
  } else {
    view.scaleBy(1.7);
    // Connect all the rest of the views into one view group!
    viewGroup.add(view);
    lineLayout.layout(view, device);
  }
}

app.on('connect', viewSetup);
app.listen(9000);
