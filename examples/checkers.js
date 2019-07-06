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
  color: 'green',
  clientLimit: 2,
}, router);

const CLIENTS = {}

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

    app.spawnItem({
      x, y,
      type: 'square',
      sequence: squareSequence(x, y, colour),
    });
  }
}

const TOTAL_BOARD_LENGTH = SQUARE_LENGTH * 10

let NEXT_USER = 0 // first user to play is the one with idx 0
let PIECE_RAISED = false

function handleTokenDrag(event, tokenOwnerIdx) {
  const tokenOwnerWebSocketID = CLIENTS[tokenOwnerIdx]
  const eventSrcWebSocketID = event.view.socket.id
  if (eventSrcWebSocketID === tokenOwnerWebSocketID) return Wams.predefined.drag(event)
}

function handleTokenClick(event, tokenOwnerIdx) {
  const tokenOwnerWebSocketID = CLIENTS[tokenOwnerIdx]
  const eventSrcWebSocketID = event.view.socket.id
  const eventSrcUserIdx = eventSrcWebSocketID === CLIENTS[0] ? 0 : 1 // hacky way, good for now
  // if (tokenOwnerWebSocketID === eventSrcWebSocketID && NEXT_USER === eventSrcUserIdx) {
  if (tokenOwnerWebSocketID === eventSrcWebSocketID) {
      console.log(`User ${eventSrcUserIdx} allowed to interact with Item ${event.target.id}.`)

    if (PIECE_RAISED) {
      console.log('move finished')
      NEXT_USER = Math.abs(tokenOwnerIdx - 1)
      app.removeItem(event.target)
      PIECE_RAISED = false
      return spawnToken(event.target.x, event.target.y, tokenOwnerIdx)
    }

    app.removeItem(event.target)
    PIECE_RAISED = true
    spawnDraggableToken(event.x, event.y, tokenOwnerIdx)
  } else {
    console.log(`User ${eventSrcUserIdx} NOT allowed to interact with Item ${event.target.id}.`)

  }
}

function spawnDraggableToken(x, y, ownerIdx) {
  spawnToken(x, y, ownerIdx, {
    ondrag: e => handleTokenDrag(e, ownerIdx),
    draggable: true,
  })
}

function spawnToken(x, y, userIdx, properties = {}) {
  let imgUrl = null
  let type = null
  if (userIdx === 0) {
    imgUrl = 'chips/Green_border.png'
    type = 'green-token'
  } else if (userIdx === 1) {
    imgUrl = 'chips/Blue_border.png'
    type = 'blue-token'
  }

  app.spawnElement(Wams.predefined.items.wrappedElement(
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
      onclick: e => handleTokenClick(e, userIdx),
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

function handleLayout(view, position) {
  console.log(app)

  // map user index (`position`) to their web socket client ID
  CLIENTS[position] = view.socket.id;

  if (position === 0) {
    view.rotateBy(Math.PI)
  }

  centerViewNormal(view)

  view.ondrag = Wams.predefined.drag;
  view.onscale = Wams.predefined.scale;
  view.onrotate = Wams.predefined.rotate;
}

app.onconnect(handleLayout);
app.listen(9012);

