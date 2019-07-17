/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const Wams = require('..');

// Spawn application with a green background for that classic playing card look.
const app = new Wams.Application({
  color: 'green',
  clientLimit: 2,
  staticDir: path.join(__dirname, './img/Chips'),
});

const SQUARE_LENGTH = 64;
function squareSequence(x, y, colour) {
  const seq = new Wams.CanvasSequence();
  seq.fillStyle = colour;
  seq.fillRect(0, 0, SQUARE_LENGTH, SQUARE_LENGTH);
  return seq;
}

const BASE = 0;
for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + (j * SQUARE_LENGTH);
    const y = BASE + (i * SQUARE_LENGTH);

    app.spawn({
      x, y,
      type: 'square',
      sequence: squareSequence(x, y, colour),
    });
  }
}

const TOTAL_BOARD_LENGTH = SQUARE_LENGTH * 10

function handleTokenDrag(event, tokenOwnerIdx) {
  if (event.view.index === tokenOwnerIdx) return Wams.predefined.drag(event)
}

function spawnToken(x, y, userIdx, properties = {}) {
  let imgUrl = null
  let type = null
  if (userIdx === 0) {
    imgUrl = 'Green_border.png'
    type = 'green-token'
  } else if (userIdx === 1) {
    imgUrl = 'Blue_border.png'
    type = 'blue-token'
  }

  app.spawn(Wams.predefined.items.html(
    `<img class="el ${properties.draggable ? 'draggable-shadow' : ''}" src="${imgUrl}" width="${SQUARE_LENGTH}" height="${SQUARE_LENGTH}" />`,
    SQUARE_LENGTH,
    SQUARE_LENGTH,
    {
      x,
      y,
      width: SQUARE_LENGTH,
      height: SQUARE_LENGTH,
      type,
      ownerIdx: userIdx,
      ondrag: e => handleTokenDrag(e, userIdx),
      ...properties,
    }
  ))

}

for (let i = 0; i < 10; i += 1) {
  for (let j = 0; j < 10; j += 1) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'black';
    const x = BASE + (j * SQUARE_LENGTH);
    const y = BASE + (i * SQUARE_LENGTH);

    if (colour === 'black') {
      if (i < 4) {
        spawnToken(x, y, 0)
      } else if (i > 5) {
        spawnToken(x, y, 1)
      }
    }
  }
}

function centerViewNormal(view) {
  view.moveTo(
    -(view.bottomRight.x - view.bottomLeft.x - TOTAL_BOARD_LENGTH) / 2,
    -(view.bottomRight.y - view.topRight.y - TOTAL_BOARD_LENGTH) / 2
  )
}

function handleConnect(view) {

  if (view.index === 0) {
    view.rotateBy(Math.PI)
  }

  centerViewNormal(view)

  view.ondrag = Wams.predefined.drag;
  view.onscale = Wams.predefined.scale;
  view.onrotate = Wams.predefined.rotate;
}

app.onconnect(handleConnect);
app.listen(9012);

