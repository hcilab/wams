/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const WAMS = require('..');
const Rectangle = WAMS.Rectangle;
const Circle = WAMS.Circle
const { image } = WAMS.predefined.items;

/*
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 *
 * Modified from: https://stackoverflow.com/a/12646864
 */
function shuffle(inArray) {
  const array = Array.from(inArray);
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

// Spawn application with a green background for that classic playing card look.
const app = new WAMS.Application({
  color: 'green',
  backgroundImage: 'green-table.jpeg',
  shadows: true,
  clientLimit: 5,
  staticDir: path.join(__dirname, '/img'),
});

const STYLES = {
  button: {
    font: 'bold 20px "Arial"',
    width: 200,
    height: 48,
    shadowColor: 'rgba(0,0,0,.5)',
  },
};

function shuffleButton(x, y) {
  const width = STYLES.button.width;
  const height = STYLES.button.height;
  const button = new WAMS.CanvasSequence();
  button.font = STYLES.button.font;
  button.shadowColor = STYLES.button.shadowColor;
  button.shadowBlur = 50;
  button.fillStyle = '#7B3E3D';
  // button.fillRect(0, 0, width, height);
  roundRect(button, 0, 0, width, height, 15, true, false);
  button.shadowBlur = 0;
  button.fillStyle = '#ddd';
  button.textAlign = 'center';
  button.textBaseline = 'middle';
  button.fillText('Collect & Shuffle', width / 2, height / 2);

  const hitbox = new Rectangle(width, height, 0, 0);

  return {
    x,
    y,
    width,
    height,
    hitbox,
    type: 'item',
    sequence: button,
    onclick: dealCards,
  };
}

function chip(chipName, x, y) {
  const radius = 40;
  return {
    x,
    y,

    // Radius for x and y too?
    // Yes: need to offset hitbox (x, y) to center of circle
    hitbox: new Circle(radius, radius, radius),

    allowDrag: true,
    type: 'item/image',
    src: `Chips/${chipName}.png`,

    // Unclear if width/height actually needed: used by WamsImage
    width: 80,
    height: 80,
  };
}

function spawnChip(chipName, x, y) {
  app.spawn(chip(chipName, x, y));
}

function chipButton(chipLabel, chipName, x, y) {
  const width = STYLES.button.width;
  const height = STYLES.button.height;
  const button = new WAMS.CanvasSequence();
  button.font = STYLES.button.font;
  button.shadowColor = STYLES.button.shadowColor;
  button.shadowBlur = 50;
  button.fillStyle = '#E8E7EA';
  roundRect(button, 0, 0, width, height, 15, true, false);
  button.shadowBlur = 0;
  button.fillStyle = '#325B29';
  button.textAlign = 'center';
  button.textBaseline = 'middle';
  button.fillText(`${chipLabel} Chip`, width / 2, height / 2);

  const hitbox = new Rectangle(width, height, 0, 0);

  return {
    x,
    y,
    width,
    height,
    hitbox,
    type: 'item',
    sequence: button,
    onclick: () => spawnChip(chipName, x + 250, y - height / 4),
  };
}

app.spawn(shuffleButton(525, 260));
app.spawn(chipButton('Green', 'GreenWhite_border', 525, 360));
app.spawn(chipButton('Blue', 'BlueWhite_border', 525, 440));
app.spawn(chipButton('Red', 'RedWhite_border', 525, 520));

// Generate a deck of cards, consisting solely of image source paths.
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'A', 'J', 'Q', 'K'];
const suits = ['C', 'D', 'H', 'S'];
const cardDescriptors = [];
const cards = [];
values.forEach((value) => {
  suits.forEach((suit) => {
    cardDescriptors.push(`Cards/hi-res/${value}${suit}.png`);
  });
});

// Select the look for the back of the cards.
const cardBackImagePath = 'Cards/Back_red_poker.png';

function dealCards() {
  cards.forEach((card) => {
    app.removeItem(card);
  });
  cards.splice(0, cards.length);

  // Generate the cards in a random order.
  let offs = 0.0;
  shuffle(cardDescriptors).forEach((card) => {
    cards.push(
      app.spawn(
        WAMS.predefined.items.image(cardBackImagePath, {
          x: 345 - offs,
          y: 300 - offs,
          width: 140,
          height: 190,
          type: 'card',
          scale: 1,
          face: card,
          isFaceUp: false,
          onclick: flipCard,
          allowDrag: true,
          allowRotate: true,
        })
      )
    );
    offs += 0.2;
  });
}

dealCards();

/*
 * Allows cards to be flipped.
 */
function flipCard(event) {
  // if (event.view.index === 0) return
  const card = event.target;
  const imgsrc = card.isFaceUp ? cardBackImagePath : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}

const tableLayout = WAMS.predefined.layouts.table(20);
function handleConnect(view, device) {
  tableLayout(view, device);
}

app.onconnect(handleConnect);
app.listen(9700);

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
    for (const side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }
}
