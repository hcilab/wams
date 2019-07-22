/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();

// Executed every time a user swipes the screen.
function handleSwipe({ x, y, velocity, direction }) {
  const cidx = Math.ceil(velocity * 10) % WAMS.colours.length;
  app.spawn(WAMS.predefined.items.rectangle(
    0,
    0,
    velocity * 10,
    32,
    WAMS.colours[cidx],
    {
      x,
      y,
      type:     'colour',
      rotation: -direction,
    },
  ));
}

function handleConnect(view) {
  view.onswipe = handleSwipe;
}

app.onconnect(handleConnect);
app.listen(9002);

