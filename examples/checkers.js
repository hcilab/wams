/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles and how item interaction could be
 * allowed or rejected based on view index.
 */

'use strict';

const path = require('path');
const WAMS = require('..');

const router = WAMS.predefined.routing.router();
const imagePath = path.join(__dirname, 'img', 'Chips');
WAMS.predefined.routing.addStaticDirectory(router, imagePath);

const app = new WAMS.Application(
  {
    color: 'green',
    clientLimit: 2,
  },
  router
);

const SQUARE_LENGTH = 64;
function squareSequence(x, y, colour) {
  const seq = new WAMS.CanvasSequence();
  seq.fillStyle = colour;
  seq.fillRect(0, 0, SQUARE_LENGTH, SQUARE_LENGTH);
  return seq;
}

const BASE = 0;
for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + j * SQUARE_LENGTH;
    const y = BASE + i * SQUARE_LENGTH;

    app.spawn({
      x,
      y,
      type: 'square',
      sequence: squareSequence(x, y, colour),
    });
  }
}

const TOTAL_BOARD_LENGTH = SQUARE_LENGTH * 10;

function handleTokenDrag(event, tokenOwnerIdx) {
  if (event.view.index === tokenOwnerIdx) {
    WAMS.predefined.actions.drag(event);
  }
}

function spawnToken(x, y, userIdx, properties = {}) {
  let imgUrl = userIdx === 0 ? 'Green_border.png' : 'Blue_border.png';

  const radius = SQUARE_LENGTH / 2;
  const token = app.spawn({
    x,
    y,
    width: SQUARE_LENGTH,
    height: SQUARE_LENGTH,
    hitbox: new WAMS.Circle(radius, radius, radius),
    type: 'item/image',
    src: imgUrl,
    ownerIdx: userIdx,
    ...properties,
  });
  token.on('drag', (e) => handleTokenDrag(e, userIdx));
}

for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + j * SQUARE_LENGTH;
    const y = BASE + i * SQUARE_LENGTH;

    if (colour === 'black') {
      if (i < 4) {
        spawnToken(x, y, 1);
      } else if (i > 5) {
        spawnToken(x, y, 0);
      }
    }
  }
}

function centerViewNormal(view) {
  view.moveTo(
    -(view.bottomRight.x - view.bottomLeft.x - TOTAL_BOARD_LENGTH) / 2,
    -(view.bottomRight.y - view.topRight.y - TOTAL_BOARD_LENGTH) / 2
  );
}

function handleConnect({ view }) {
  if (view.index === 1) {
    view.rotateBy(Math.PI);
  }

  centerViewNormal(view);

  view.on('drag', WAMS.predefined.actions.drag);
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('rotate', WAMS.predefined.actions.rotate);
}

app.on('connect', handleConnect);
app.listen(9000);
