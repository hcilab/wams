/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();

/*
 * Draw a thick line in the direction of the swipe, whose length is its
 * velocity, with a colour that is selected by the velocity % 10.
 */
function handleSwipe({ x, y, velocity, direction }) {
  const cidx = Math.ceil(velocity * 10) % WAMS.colours.length;
  // console.count('swipes');
  // console.dir({ msg: 'Swipe registered', x, y, velocity, direction });
  app.spawn(
    WAMS.predefined.items.rectangle(x, y, velocity * 25, 32, WAMS.colours[cidx], {
      rotation: -direction,
    })
  );
}

/*
 * Draw a thin line connecting every drag.
 */
function handleDrag({ x, y, dx, dy }) {
  const length = Math.sqrt(dx * dx + dy * dy);
  const line = app.spawn(
    WAMS.predefined.items.rectangle(x, y, 10, length, 'gray', {
      rotation: Math.atan2(dx, dy),
    })
  );
  // console.log('Line: { x: %s, y: %s, length: %s, rotation: %s }', line.x, line.y, length, line.rotation);
  setTimeout(() => app.removeItem(line), 3000);
}

function handleConnect({ view }) {
  view.on('swipe', handleSwipe);
  view.on('drag', handleDrag);
}

app.on('connect', handleConnect);
app.listen(9000);
