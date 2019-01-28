/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

// Executed every time a user taps or clicks a screen
const handleSwipe = (function makeSwipeHandler(ws) {
  function square(ix, iy, index, velo) {
    const x = ix;
    const y = iy - 16;
    const width = velo * 10;
    const height = 32;
    const type = 'colour';
    const blueprint = rectSeq(index);
    return {x, y, width, height, type, blueprint};
  }

  function handleSwipe(view, target, x, y, velocity, direction) {
    const cidx = Math.ceil(velocity * 10) % Wams.colours.length;
    ws.spawnItem( Wams.predefined.items.rectangle(
      0,
      0,
      velocity * 10,
      32,
      Wams.colours[cidx],
      { 
        x,
        y,
        type: 'colour',
        rotation: -direction,
      },
    ));
  }

  return handleSwipe;
})(ws);

// Executed once per user, when they join.
// function handleLayout(view, position) {
  // view.moveTo(4000,4000);
// }

// Attaches the defferent function handlers
// ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('swipe',  handleSwipe);

ws.listen(9002);

