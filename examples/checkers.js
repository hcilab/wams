/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles and how item interaction could be
 * allowed or rejected based on view index.
 */

'use strict';

const path = require('path');
const WAMS = require('..');

const app = new WAMS.Application({
  color: 'green',
  clientLimit: 2,
});
app.addStaticDirectory(path.join(__dirname, 'img', 'Chips'));

const SQUARE_LENGTH = 64;
const SQUARES_PER_SIDE = 10;
const TOTAL_BOARD_LENGTH = SQUARE_LENGTH * SQUARES_PER_SIDE;

/**
 * Add a square to the canvas.
 */
function addSquare(canvas, x, y, colour) {
  canvas.fillStyle = colour;
  canvas.fillRect(x, y, SQUARE_LENGTH, SQUARE_LENGTH);
}

function board(x, y) {
  const sequence = new WAMS.CanvasSequence();
  const base = 0;
  for (let i = 0; i < SQUARES_PER_SIDE; ++i) {
    for (let j = 0; j < SQUARES_PER_SIDE; ++j) {
      const colour = (i + j) % 2 === 0 ? 'white' : 'grey';
      const x = base + j * SQUARE_LENGTH;
      const y = base + i * SQUARE_LENGTH;
      addSquare(sequence, x, y, colour);
    }
  }
  return {
    x: 0,
    y: 0,
    type: 'item',
    sequence: sequence,
  };
}

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

function spawnTokens() {
  for (let i = 0; i < 10; i += 1) {
    for (let j = 0; j < 10; j += 1) {
      const colour = (i + j) % 2 === 0 ? 'white' : 'black';
      const x = j * SQUARE_LENGTH;
      const y = i * SQUARE_LENGTH;

      if (colour === 'black') {
        if (i < 4) {
          spawnToken(x, y, 1);
        } else if (i > 5) {
          spawnToken(x, y, 0);
        }
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

app.spawn(board(0, 0));
spawnTokens();
app.on('connect', handleConnect);
app.listen(9000);
