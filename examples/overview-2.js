'use strict';
const WAMS = require('..');
const path = require('path');
// const { formatWithCursor } = require('prettier');
const app = new WAMS.Application({
  clientScripts: ['custom-events.js'],
});
app.addStaticDirectory(path.join(__dirname, './client'));
const { image } = WAMS.predefined.items;
const rectangle = WAMS.predefined.items.rectangle;

// app globals
let appCreated = false;

let overviewScale;
let viewRect = null;
let detailView;
let selected = false;
let prevX, prevY;

//------------------------------------------------------
// WAMS functions
//------------------------------------------------------

function handleConnect({ view, device }) {
  view.on('click', startApp);
  console.log('connecting view id: ' + view.id);
  if (view.id == 1) {
    view.scale = 1.0;
    view.x = 2000;
    view.y = 2000;
  }
  if (view.id == 2) {
    overviewScale = view.width / 6587;
    view.scale = overviewScale;
    view.x = 0;
    view.y = 0;
  }
}

function startApp() {
  if (appCreated) return;
  appCreated = true;
  app.spawn(
    image('ireland-map.jpg', {
      width: 6587,
      height: 8336,
      x: 0,
      y: 0,
    })
  );

  // view rectangle in overview
  detailView = app.viewspace.views[0];
  let sequence = new WAMS.CanvasSequence();
  //sequence.fillStyle = "#FFFFFFFF";
  sequence.strokeStyle = 'red';
  sequence.lineWidth = 40.0;
  sequence.strokeRect(0, 0, detailView.width + 40, detailView.height + 40);
  const hitbox = new WAMS.Rectangle(detailView.width, detailView.height);
  viewRect = app.spawn({
    x: detailView.x - 20,
    y: detailView.y - 20,
    hitbox,
    sequence,
    scale: 1 / detailView.scale,
    rotation: detailView.rotation,
  });
}

//------------------------------------------------------
// Handle custom events
//------------------------------------------------------

app.on('mousedown', (event) => {
  console.log('mousedown');
  if (!appCreated) {
    return;
  }
  // custom event gives us canvas coords; need to convert to WAMS coords
  const { view } = event;
  let wX = (event.x + view.x) / view.scale;
  let wY = (event.y + view.y) / view.scale;
  console.log(wX + ',' + wY);
  console.log(
    detailView.x +
      ',' +
      (detailView.x + detailView.width) +
      ',' +
      detailView.y +
      ',' +
      (detailView.y + detailView.height)
  );
  console.log(
    'conditional value: ' +
      (wX >= detailView.x &&
        wX <= detailView.x + detailView.width &&
        wY >= detailView.y &&
        wY <= detailView.y + detailView.height)
  );
  if (
    wX >= detailView.x &&
    wX <= detailView.x + detailView.width &&
    wY >= detailView.y &&
    wY <= detailView.y + detailView.height
  ) {
    prevX = wX;
    prevY = wY;
    selected = true;
    console.log('selected');
  }
  // let item = app.workspace.findItemByCoordinates(wX, wY);
  // if (item) {
  //     prevX = wX;
  //     prevY = wY;
  //     selected = item;
  //     console.log(item);
  // }
});

app.on('mousemove', (event) => {
  //console.log("mousemove");
  const { view } = event;
  if (selected) {
    let wX = (event.x + view.x) / view.scale;
    let wY = (event.y + view.y) / view.scale;
    let dX = wX - prevX;
    let dY = wY - prevY;
    prevX = wX;
    prevY = wY;
    //console.log(dX + "|" + dY);
    detailView.moveBy(dX, dY);
    viewRect.moveTo(detailView.x - 20, detailView.y - 20);
  }
});

app.on('mouseup', (event) => {
  const { view } = event;
  console.log('mouseup');
});

//------------------------------------------------------
// Start WAMS app
//------------------------------------------------------

app.on('connect', handleConnect);
app.listen(3500);
