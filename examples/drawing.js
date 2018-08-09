/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer();

const items = new Map();

function rectSeq(x, y, width, height, colour) {
  const seq = new WAMS.CanvasSequencer();
  seq.fillStyle = colour;
  seq.fillRect(x, y, width, height);
  return seq;
}

// Executed every time a user taps or clicks a screen
const handleClick = (function makeClickHandler(ws) {
  const colours = [
    'blue',
    'red',
    'green',
    'pink',
    'cyan',
    'yellow',
  ];

  function square(ix, iy, index) {
    const x = ix - 64;
    const y = iy - 64;
    const width = 128;
    const height = 128;
    const type = 'colour';
    const canvasSequence = rectSeq(x, y, width, height, colours[index]);
    return {x, y, width, height, type, canvasSequence};
  }

  function handleClick(viewer, target, x, y) {
    if (target.type === 'colour') {
      ws.removeItem(target);
      items.delete(target.id);
    } else {
      const item = square(x, y, viewer.id % 6);
      const spawned = ws.spawnItem(item);
      items.set(spawned.id, colours[viewer.id % 6]);
    }
  }

  return handleClick;
})(ws);

// Executed every time a drag occurs on a device
function handleDrag(viewer, target, x, y, dx, dy) {
  if (target.type === 'colour') {
    target.moveBy(dx, dy);
    const canvasSequence = rectSeq(
      target.x,
      target.y,
      target.width,
      target.height,
      items.get(target.id)
    );
    target.assign({canvasSequence});
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

