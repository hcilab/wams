/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server');
const ws = new Wams();

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

  function rectSeq(index) {
    const seq = new Wams.Sequence();
    seq.fillStyle = colours[index];
    seq.fillRect('{x}', '{y}', '{width}', '{height}');
    return seq;
  }

  function square(ix, iy, index) {
    const x = ix - 64;
    const y = iy - 64;
    const width = 128;
    const height = 128;
    const type = 'colour';
    const blueprint = rectSeq(index);
    return {x, y, width, height, type, blueprint};
  }

  function handleClick(view, target, x, y) {
    if (target.type === 'colour') {
      ws.removeItem(target);
    } else {
      ws.spawnItem(square(x, y, view.id % 6));
    }
  }

  return handleClick;
})(ws);

// Executed every time a drag occurs on a device
function handleDrag(view, target, x, y, dx, dy) {
  if (target.type === 'colour') {
    target.moveBy(dx, dy);
  } else if (target.type === 'view/background') {
    target.moveBy(-dx, -dy);
  }
  ws.update(target);
}

// Executed when a user rotates two fingers around the screen.
function handleRotate(view, radians) {
  view.rotation += radians;
  ws.update(view);
}

// Executed once per user, when they join.
function handleLayout(view, position) {
  view.moveTo(4000,4000);
  ws.update(view);
}

// Attaches the defferent function handlers
ws.on('click',  handleClick);
ws.on('drag',   handleDrag);
ws.on('layout', handleLayout);
ws.on('rotate', handleRotate);

ws.listen(9004);

