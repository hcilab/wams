/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

// Executed every time a user swipes the screen.
function handleSwipe({ x, y, velocity, direction }) {
  const cidx = Math.ceil(velocity * 10) % Wams.colours.length;
  app.spawnItem(Wams.predefined.items.rectangle(
    0,
    0,
    velocity * 10,
    32,
    Wams.colours[cidx],
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

app.onlayout(handleConnect);
app.listen(9002);

