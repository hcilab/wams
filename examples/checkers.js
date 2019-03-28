/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const Wams = require('..');

// Provide custom route for card assets
const router = new Wams.Router();
const images = path.join(__dirname, '../img/Chips');
router.use('/chips', router.express.static(images));

// Spawn application with a green background for that classic playing card look.
const app = new Wams.Application({
  color:       'green',
  // clientLimit: 2,
}, router);

const WIDTH = 64;
const HEIGHT = 64;
function squareSequence(x, y, colour) {
  const seq = new Wams.CanvasSequence();
  seq.fillStyle = colour;
  seq.fillRect(0, 0, WIDTH, HEIGHT);
  return seq;
}

const BASE = 256;
for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + (j * WIDTH);
    const y = BASE + (i * HEIGHT);

    app.spawnItem({
      x, y,
      type:     'square',
      sequence: squareSequence(x, y, colour),
    });
  }
}

for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + (j * WIDTH);
    const y = BASE + (i * HEIGHT);

    if (colour === 'black') {
      if (i < 4) {
        app.spawnImage(Wams.predefined.items.image('chips/Green_border.png', {
          x, y,
          width:  WIDTH,
          height: HEIGHT,
          type:   'green-token',
          ondrag: Wams.predefined.drag,
        }));
      } else if (i > 5) {
        app.spawnImage(Wams.predefined.items.image('chips/Blue_border.png', {
          x, y,
          width:  WIDTH,
          height: HEIGHT,
          type:   'white-token',
          ondrag: Wams.predefined.drag,
        }));
      }
    }
  }
}

function handleLayout(view) {
  view.ondrag = Wams.predefined.drag;
  view.onscale = Wams.predefined.scale;
  view.onrotate = Wams.predefined.rotate;
}

app.onlayout(handleLayout);
app.listen(9012);

