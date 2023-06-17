/*
 *  This example is intended to demonstrate how users can coordinate with the
 *  workspace from several different angles and how item interaction could be
 *  allowed or rejected based on view index.
 */

'use strict';

const WAMS = require('..');
const path = require('path');

const router = WAMS.predefined.routing.router();
const imagePath = path.join(__dirname, 'img', 'chess_pieces');
WAMS.predefined.routing.addStaticDirectory(router, imagePath);

const app = new WAMS.Application(
  {
    color: 'peru', // background color of the app
    clientLimit: 2, // maximum number of devices that can connect to the app
    shadows: true, // show shadows of other devices
    title: 'Chess using Wams', // page title
  },
  router
);

const SQUARE_LENGTH = 64; // No. of squares required

/* Function to black white & black squares on the board */
function squareSequence(x, y, colour) {
  const seq = new WAMS.CanvasSequence();
  seq.fillStyle = colour;
  seq.fillRect(0, 0, SQUARE_LENGTH, SQUARE_LENGTH);
  return seq;
}

const BASE = 0;
for (let i = 0; i < 8; ++i) {
  for (let j = 0; j < 8; ++j) {
    const colour = (i + j) % 2 === 0 ? 'white' : 'grey';
    const x = BASE + j * SQUARE_LENGTH;
    const y = BASE + i * SQUARE_LENGTH;

    app.spawn({
      x,
      y,
      type: 'item',
      sequence: squareSequence(x, y, colour),
    });
  }
}

const TOTAL_BOARD_LENGTH = SQUARE_LENGTH * 8;

/* Function to handle interaction rights between devices to drag pieces on board */
function handleTokenDrag(e, tokenOwnerIdx) {
  if (e.view.index !== tokenOwnerIdx) {
    WAMS.predefined.actions.drag(e);
  }
}

/* Function to spawn pieces at right place on board */
function spawnToken(x, y, userIdx, tokenIdx, properties = {}) {
  let imgUrl = null;
  let type = null;

  // For Black pieces
  if (userIdx === 0) {
    if (tokenIdx === 0) {
      imgUrl = 'Black_pawn.png';
      type = 'black-token';
    } else if (tokenIdx === 1) {
      imgUrl = 'Black_Rook.png';
      type = 'black-token';
    } else if (tokenIdx === 2) {
      imgUrl = 'Black_Knight.png';
      type = 'black-token';
    } else if (tokenIdx === 3) {
      imgUrl = 'Black_Bishop.png';
      type = 'black-token';
    } else if (tokenIdx === 4) {
      imgUrl = 'Black_Queen.png';
      type = 'black-token';
    } else if (tokenIdx === 5) {
      imgUrl = 'Black_King.png';
      type = 'black-token';
    }
  }

  // For White pieces
  else if (userIdx === 1) {
    if (tokenIdx === 0) {
      imgUrl = 'White_pawn.png';
      type = 'white-token';
    } else if (tokenIdx === 1) {
      imgUrl = 'White_Rook.png';
      type = 'white-token';
    } else if (tokenIdx === 2) {
      imgUrl = 'White_Knight.png';
      type = 'white-token';
    } else if (tokenIdx === 3) {
      imgUrl = 'White_Bishop.png';
      type = 'white-token';
    } else if (tokenIdx === 4) {
      imgUrl = 'White_Queen.png';
      type = 'white-token';
    } else if (tokenIdx === 5) {
      imgUrl = 'White_King.png';
      type = 'white-token';
    }
  }

  const token = app.spawn(
    WAMS.predefined.items.html(
      `<div><img src="${imgUrl}" width="${SQUARE_LENGTH}" height="${SQUARE_LENGTH}" /></div>`,
      SQUARE_LENGTH,
      SQUARE_LENGTH,
      {
        x,
        y,
        width: SQUARE_LENGTH,
        height: SQUARE_LENGTH,
        type,
        ownerIdx: userIdx,
        // rotation: event => handleRotate(event),
        ...properties,
      }
    )
  );
  token.on('drag', (e) => handleTokenDrag(e, userIdx));
}

// Spawning all pieces iteratively
for (let i = 0; i < 8; ++i) {
  for (let j = 0; j < 8; ++j) {
    const x = j * SQUARE_LENGTH;
    const y = i * SQUARE_LENGTH;

    // spawning black pawns
    if (i === 1) spawnToken(x, y, 0, 0);
    // spawning white pawns
    else if (i === 6) spawnToken(x, y, 1, 0);
    // spawning rest of the black pieces
    else if (i === 0) {
      if (j === 0 || j === 7) spawnToken(x, y, 0, 1); // rooks
      else if (j === 1 || j === 6) spawnToken(x, y, 0, 2); // knights
      else if (j === 2 || j === 5) spawnToken(x, y, 0, 3); // bishops
      else if (j === 3) spawnToken(x, y, 0, 4); // Queen
      else spawnToken(x, y, 0, 5); // King
    }
    // spawning rest of the white pieces
    else if (i === 7) {
      if (j === 0 || j === 7) spawnToken(x, y, 1, 1); // rooks
      else if (j === 1 || j === 6) spawnToken(x, y, 1, 2); // knights
      else if (j === 2 || j === 5) spawnToken(x, y, 1, 3); // bishops
      else if (j === 3) spawnToken(x, y, 1, 4); // Queen
      else spawnToken(x, y, 1, 5); // King
    }
  }
}

/* Function to place board at center of the device view */
function centerViewNormal(view) {
  view.moveTo(
    -(view.bottomRight.x - view.bottomLeft.x - TOTAL_BOARD_LENGTH) / 2,
    -(view.bottomRight.y - view.topRight.y - TOTAL_BOARD_LENGTH) / 2
  );
}

/* Function to place board at center of the device view */
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
