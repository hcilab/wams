/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const WAMS = require('../src/server');

const ws = new WAMS.WamsServer();

ws.spawnItem({
  x: 200, y: 200, width: 200, height: 200,
  type: 'Draggable',
  imgsrc: 'img/monaLisa.png',
});

ws.spawnItem({
  x: 400, y: 400, width: 200, height: 200,
  type: 'Draggable',
  imgsrc: 'img/scream.png'
});

function handleDrag(viewer, target, x, y, dx, dy) {
  if (target.type === 'Draggable') {
    target.moveBy(-dx, -dy);
    update(target, target.report());
  }
}

function handleLayout(viewer, numViewers) {
  if (numViewers > 1) {
    viewer.moveTo( viewer.right - 30, viewer.top ); 
    update(viewer, viewer.report());
  }
}

ws.on('drag', handleDrag);
ws.on('layout', handleLayout);

ws.listen(9003);

