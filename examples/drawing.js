/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer();

ws.spawnItem({
  x: 32, y: 32,
  width: 128, height: 128,
  type: 'color',
  imgsrc: 'img/red.png',
});

// Executed every time a user taps or clicks a screen
const handleClick = (function makeClickHandler(ws) {
  const sources = [
    'img/blue.png',
    'img/red.png',
    'img/green.png',
    'img/pink.png',
    'img/cyan.png',
    'img/yellow.png',
  ];

  function square(x, y, index) {
    return {
      x: x - 64, y: y - 64, 
      width: 128, height: 128, 
      type: 'color', 
      imgsrc: sources[index]
    };
  }

  function handleClick(viewer, target, x, y) {
    if (target.type === 'color') {
      ws.removeItem(target);
    } else {
      ws.spawnItem(square(x, y, viewer.id % 6));
    }
  }

  return handleClick;
})(ws);

// Executed every time a drag occurs on a device
function handleDrag(viewer, target, x, y, dx, dy) {
  if (target.type === 'color') {
    target.moveBy(dx, dy);
  } else if (target.type === 'view/background') {
    target.moveBy(-dx, -dy);
  }
  ws.update(target);
}

// Executed when a user pinches a device, or uses the scroll wheel on a computer
function handleScale(viewer, newScale) {
  viewer.rescale(newScale);
  ws.update(viewer);
}

// Attaches the defferent function handlers
ws.on('click', handleClick);
ws.on('scale', handleScale);
ws.on('drag',  handleDrag);

ws.listen(9002);

