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
  color: 'green',
  // clientLimit: 5,
}, router);

// maps `position` index to web socket ID
const CLIENTS = {}

// Demonstrate a custom rendering sequence.
const circle = new Wams.CanvasSequence();
circle.beginPath();
circle.arc(0, 0, 150, Math.PI, 0, false);
circle.closePath();
circle.fillStyle = 'white';
circle.fill();
circle.lineWidth = 5;
circle.strokeStyle = '#003300';
circle.stroke();

app.spawnItem({
  x: 500,
  y: 250,
  type: 'circle',
  sequence: circle,
});

// Text is possible too!
const text = new Wams.CanvasSequence();
text.font = 'normal 36px Times,serif';
text.fillStyle = '#1a1a1a';
text.fillText('Deal the cards!', 0, 0);

app.spawnItem({
  x: 380,
  y: 230,
  type: 'text',
  sequence: text,
});

// Draw a card deck outline.
app.spawnItem(Wams.predefined.items.rectangle(0, 0, 140, 190, 'lightgrey', {
  x: 515,
  y: 300,
  onclick: dealCards,
}));

const deal = new Wams.CanvasSequence();
deal.font = 'normal 30px sans-serif';
deal.fillStyle = 'black';
deal.fillText('Shuffle', 0, 0);

app.spawnItem({
  x: 525,
  y: 400,
  type: 'text',
  sequence: deal,
});


// Generate a deck of cards, consisting solely of image source paths.
const values = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'J', 'Q', 'K',
];
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];
const cardDescriptors = [];
const cards = [];
values.forEach(value => {
  suits.forEach(suit => {
    cardDescriptors.push(`cards/${suit}${value}.png`);
  });
});

// Select the look for the back of the cards.
const card_back_path = 'cards/Back_blue4.png';

function dealCards() {
  cards.forEach(card => {
    app.removeItem(card);
  });
  cards.splice(0, cards.length);

  // Generate the cards in a random order.
  let offs = 0.0;
  shuffle(cardDescriptors).forEach(card => {
    cards.push(app.spawnImage(Wams.predefined.items.image(card_back_path, {
      x: 345 - offs,
      y: 300 - offs,
      width: 140,
      height: 190,
      type: 'card',
      scale: 1,
      face: card,
      isFaceUp: false,
      onclick: flipCard,
      ondrag: Wams.predefined.drag,
      onrotate: Wams.predefined.rotate,
    })));
    offs += 0.2;
  });
}

dealCards();

/*
 * Allows cards to be flipped.
 */
function flipCard(event) {
  if (event.view.socket.id === CLIENTS[0]) return
  const card = event.target;
  const imgsrc = card.isFaceUp ? card_back_path : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}

const tableLayout = Wams.predefined.layouts.table(200);
function handleLayout(view, position) {
  let socketId = view.socket.id
  CLIENTS[position] = socketId
  if (position === 0) {
    console.log(position)
    // User is the "table". Allow them to move around and scale.
    view.ondrag = Wams.predefined.drag;
    view.onscale = Wams.predefined.scale;
  }
  tableLayout(view, position);
}

app.onlayout(handleLayout);
app.listen(9011);

