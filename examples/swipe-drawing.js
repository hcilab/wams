/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

// Executed every time a user swipes the screen.
function handleSwipe(view, target, x, y, velocity, direction) {
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

// Attaches the defferent function handlers
app.on('swipe',  handleSwipe);

app.listen(9002);

