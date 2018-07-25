/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const WAMS = require('../src/server');

const workspace = new WAMS.WorkSpace({
  bounds: {
    x: 1000,
    y: 1000,
  },
  clientLimit: 10,
  color: '#aaaaaa',
});

workspace.spawnItem({
  x: 200,
  y: 200,
  width: 200,
  height: 200,
  type: 'Draggable',
  imgsrc: 'monaLisa.png',
});

workspace.spawnItem({
  x: 400,
  y: 400,
  width: 200,
  height: 200,
  type: 'Draggable',
  imgsrc: 'scream.png'
});

function handleDrag(viewer, target, x, y, dx, dy) {
  if (target.type === 'Draggable') {
    target.moveBy(-dx, -dy);
  }
}

function handleLayout(viewer) {
  const viewers = workspace.viewers;
  const num_viewers = viewers.length;

  if (viewers.length > 0) {
    viewer.moveTo(
      viewer.right - 30,
      viewer.top
    ); 
  }
}

workspace.on('drag', handleDrag);
workspace.on('layout', handleLayout);

new WAMS.WamsServer(workspace).listen(9003);


