/*
 *  This example is intended to demonstrate how users can coordinate with the
 *  workspace from several different angles and how item interaction could be
 *  allowed or rejected based on view index.
 */

'use strict';

const path = require('path');
const WAMS = require('..');
const { actions, items } = WAMS.predefined;

const app = new WAMS.Application({
  color: 'peru', // background color of the app
  clientLimit: 2, // maximum number of devices that can connect to the app
  shadows: true, // show shadows of other devices
  status: true,
  title: 'Chess using Wams', // page title
});
app.addStaticDirectory(path.join(__dirname, 'img', 'chess_pieces'));

const SQUARE_LENGTH = 64;
const SQUARES_PER_SIDE = 8;
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

const BLACK_PLAYER_IDX = 1;
const WHITE_PLAYER_IDX = 0;

/* Function to handle interaction rights between devices to drag pieces on board */
function handleTokenDrag(event, tokenOwnerIdx) {
  if (event.view.index === tokenOwnerIdx) {
    actions.drag(event);
  }
}

const Pieces = {
  PAWN: 0,
  ROOK: 1,
  KNIGHT: 2,
  BISHOP: 3,
  QUEEN: 4,
  KING: 5,
};
const WhitePieceImages = {
  [Pieces.PAWN]: 'White_pawn.png',
  [Pieces.ROOK]: 'White_Rook.png',
  [Pieces.KNIGHT]: 'White_Knight.png',
  [Pieces.BISHOP]: 'White_Bishop.png',
  [Pieces.QUEEN]: 'White_Queen.png',
  [Pieces.KING]: 'White_King.png',
};
const BlackPieceImages = {
  [Pieces.PAWN]: 'Black_pawn.png',
  [Pieces.ROOK]: 'Black_Rook.png',
  [Pieces.KNIGHT]: 'Black_Knight.png',
  [Pieces.BISHOP]: 'Black_Bishop.png',
  [Pieces.QUEEN]: 'Black_Queen.png',
  [Pieces.KING]: 'Black_King.png',
};

/* Function to spawn pieces at right place on board */
function spawnToken(x, y, userIdx, tokenIdx) {
  let imgUrl = null;
  switch (userIdx) {
    case BLACK_PLAYER_IDX:
      imgUrl = BlackPieceImages[tokenIdx];
      break;
    case WHITE_PLAYER_IDX:
      imgUrl = WhitePieceImages[tokenIdx];
      break;
    default:
      throw new Error('Invalid user index');
  }

  const token = app.spawn(
    items.image(
      imgUrl,
      {
        x,
        y,
        width: SQUARE_LENGTH,
        height: SQUARE_LENGTH,
        ownerIdx: userIdx,
      }
    )
  );
  token.on('drag', (e) => handleTokenDrag(e, userIdx));
}

function spawnPawns(row, userIdx) {
  const y = row * SQUARE_LENGTH;
  for (let column = 0; column < SQUARES_PER_SIDE; ++column) {
    spawnToken(column * SQUARE_LENGTH, y, userIdx, Pieces.PAWN);
  }
}

function spawnPowerPieces(row, userIdx) {
  const y = row * SQUARE_LENGTH;
  spawnToken(0, y, userIdx, Pieces.ROOK);
  spawnToken(7 * SQUARE_LENGTH, y, userIdx, Pieces.ROOK);
  spawnToken(1 * SQUARE_LENGTH, y, userIdx, Pieces.KNIGHT);
  spawnToken(6 * SQUARE_LENGTH, y, userIdx, Pieces.KNIGHT);
  spawnToken(2 * SQUARE_LENGTH, y, userIdx, Pieces.BISHOP);
  spawnToken(5 * SQUARE_LENGTH, y, userIdx, Pieces.BISHOP);
  spawnToken(3 * SQUARE_LENGTH, y, userIdx, Pieces.QUEEN);
  spawnToken(4 * SQUARE_LENGTH, y, userIdx, Pieces.KING);
}

/* Function to place board at center of the view */
function centerViewNormal(view) {
  view.moveTo(
    -(view.bottomRight.x - view.bottomLeft.x - TOTAL_BOARD_LENGTH) / 2,
    -(view.bottomRight.y - view.topRight.y - TOTAL_BOARD_LENGTH) / 2
  );
}

/* Function to place board at center of the view */
function handleConnect({ view }) {
  if (view.index === BLACK_PLAYER_IDX) {
    view.rotateBy(Math.PI);
  }

  centerViewNormal(view);

  view.on('drag', actions.drag);
  view.on('pinch', actions.pinch);
  view.on('rotate', actions.rotate);
}

app.spawn(board(0, 0));
spawnPowerPieces(0, BLACK_PLAYER_IDX);
spawnPawns(1, BLACK_PLAYER_IDX);
spawnPawns(6, WHITE_PLAYER_IDX);
spawnPowerPieces(7, WHITE_PLAYER_IDX);

app.on('connect', handleConnect);
app.listen(9000);
