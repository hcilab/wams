/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

// Executed every time a user taps or clicks a screen
const handleSwipe = (function makeSwipeHandler(app) {
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
    app.spawnItem( Wams.predefined.items.rectangle(
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
})(app);

// Attaches the defferent function handlers
app.on('swipe',  handleSwipe);

app.listen(9002);
