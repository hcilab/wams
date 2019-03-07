/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const Wams = require('..');

/*
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 *
 * Modified from: https://stackoverflow.com/a/12646864
 */
function shuffle(in_array) {
  const array = Array.from(in_array);
  for (let i = array.length - 1; i > 0; --i) {
    // No danger of accessing past array length, because Math.random() operates
    // on the set [0,1)
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// Provide custom route for card assets
const router = new Wams.Router();
const images = path.join(__dirname, '../img/Cards');
router.use('/cards', router.express.static(images));

// Spawn application with a green background for that classic playing card look.
const app = new Wams.Application({
  color:       'green',
  clientLimit: 5,
}, router);

// Demonstrate a custom rendering sequence.
const circle = new Wams.Sequence();
circle.beginPath();
circle.arc(0, 0, 150, Math.PI, 0, false);
circle.closePath();
circle.fillStyle = 'white';
circle.fill();
circle.lineWidth = 5;
circle.strokeStyle = '#003300';
circle.stroke();

app.spawnItem({
  x:         500,
  y:         250,
  type:      'circle',
  blueprint: circle,
});

// Text is possible too!
const text = new Wams.Sequence();
text.font = 'normal 36px Times,serif';
text.fillStyle = '#1a1a1a';
text.fillText('Deal the cards!', 0, 0);

app.spawnItem({
  x:         380,
  y:         230,
  type:      'text',
  blueprint: text,
});

// Generate a deck of cards, consisting solely of image source paths.
const values = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'J', 'Q', 'K',
];
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
const cards = [];
values.forEach(value => {
  suits.forEach(suit => {
    cards.push(`cards/${suit}${value}.png`);
  });
});

// Select the look for the back of the cards.
const card_back_path = 'cards/Back_blue4.png';

// Generate the cards in a random order.
let offs = 0.0;
shuffle(cards).forEach(card => {
  app.spawnImage(Wams.predefined.items.image(card_back_path, {
    x:        430 - offs,
    y:        400 - offs,
    width:    140,
    height:   190,
    type:     'card',
    scale:    1,
    face:     card,
    isFaceUp: false,
  }));
  offs += 0.2;
});

/*
 * Lays out four views around a central table view.
 */
const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const TABLE   = 0;
  const BOTTOM  = 1;
  const LEFT    = 2;
  const TOP     = 3;
  const RIGHT   = 4;
  const OVERLAP = 30;

  function layoutTable(view) {
    table = view;
  }

  function layoutBottom(view) {
    const anchor = table.bottomLeft;
    view.moveTo(anchor.x, anchor.y - OVERLAP);
  }

  function layoutLeft(view) {
    const anchor = table.topLeft;
    view.moveTo(anchor.x + OVERLAP, anchor.y);
    view.rotateBy(Math.PI / 2);
  }

  function layoutTop(view) {
    const anchor = table.topRight;
    view.moveTo(anchor.x, anchor.y + OVERLAP);
    view.rotateBy(Math.PI);
  }

  function layoutRight(view) {
    const anchor = table.bottomRight;
    view.moveTo(anchor.x - OVERLAP, anchor.y);
    view.rotateBy(Math.PI * 3 / 2);
  }

  function dependOnTable(fn) {
    return function layoutDepender(view) {
      if (table == null) {
        setTimeout(() => layoutDepender(view), 0);
      } else {
        fn(view);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[BOTTOM]  = dependOnTable(layoutBottom);
  user_fns[LEFT]    = dependOnTable(layoutLeft);
  user_fns[TOP]     = dependOnTable(layoutTop);
  user_fns[RIGHT]   = dependOnTable(layoutRight);

  function handleLayout(view, position) {
    user_fns[position](view);
  }

  return handleLayout;
}());

/*
 * Allows cards to be flipped.
 */
function flipCard(card) {
  const imgsrc = card.isFaceUp ? card_back_path : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}

app.on('click',  Wams.predefined.taps.modifyItem(flipCard, 'card'));
app.on('drag',   Wams.predefined.drags.items(['card']));
app.on('rotate', Wams.predefined.rotates.items(['card']));
app.on('layout', handleLayout);

app.listen(9001);

