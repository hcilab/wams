/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

// Executed every time a user taps or clicks a screen
const handleSwipe = (function makeSwipeHandler(ws) {
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

  function square(ix, iy, index, velo) {
    const x = ix;
    const y = iy - 16;
    const width = velo * 10;
    const height = 32;
    const type = 'colour';
    const blueprint = rectSeq(index);
    return {x, y, width, height, type, blueprint};
  }

  function handleSwipe(view, target, velocity, x, y, direction) {
    const colour = Math.ceil(velocity * 10) % colours.length;
    ws.spawnItem(
      square(x, y, colour, velocity)
    );
  }

  return handleSwipe;
})(ws);

// Executed once per user, when they join.
function handleLayout(view, position) {
  view.moveTo(4000,4000);
  ws.update(view);
}

// Attaches the defferent function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('swipe',  handleSwipe);

ws.listen(9002);

