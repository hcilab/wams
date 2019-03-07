/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const Wams = require('..');

const router = new Wams.Router();
const images = path.join(__dirname, '../img/cards');
router.use('/cards', router.express.static(images));

const app = new Wams.Application({
  color:       'green',
  clientLimit: 5,
}, router);

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
  x:         2500,
  y:         2500,
  type:      'circle',
  blueprint: circle,
});

const text = new Wams.Sequence();
text.font = 'normal 36px Times,serif';
text.fillStyle = '#1a1a1a';
text.fillText('Click the cards!', 0, 0);

app.spawnItem({
  x:         2380,
  y:         2480,
  type:      'text',
  blueprint: text,
});

const joker_path = 'cards/red_joker.png';
app.spawnImage(Wams.predefined.items.image(joker_path, {
  x:        2600,
  y:        2700,
  width:    500,
  height:   726,
  type:     'card',
  scale:    0.5,
  face:     joker_path,
  isFaceUp: true,
}));

const ace_path = 'cards/ace_of_spades.png';
app.spawnImage(Wams.predefined.items.image(ace_path, {
  x:        2100,
  y:        1900,
  width:    500,
  height:   726,
  type:     'card',
  scale:    0.5,
  face:     ace_path,
  isFaceUp: true,
}));

const card_back_path = 'cards/back.png';

const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const TABLE   = 0;
  const BOTTOM  = 1;
  const LEFT    = 2;
  const TOP     = 3;
  const RIGHT   = 4;

  function layoutTable(view) {
    view.moveTo(2000, 2000);
    table = view;
  }

  function layoutBottom(view) {
    const anchor = table.bottomLeft;
    view.moveTo(anchor.x, anchor.y);
  }

  function layoutLeft(view) {
    const anchor = table.topLeft;
    view.moveTo(anchor.x, anchor.y);
    view.rotateBy(Math.PI * 3 / 2);
  }

  function layoutTop(view) {
    const anchor = table.topRight;
    view.moveTo(anchor.x, anchor.y);
    view.rotateBy(Math.PI);
  }

  function layoutRight(view) {
    const anchor = table.bottomRight;
    view.moveTo(anchor.x, anchor.y);
    view.rotateBy(Math.PI / 2);
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

function flipCard(card) {
  const imgsrc = card.isFaceUp ? card_back_path : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}

app.on('click',  Wams.predefined.taps.modifyItem(flipCard, 'card'));
app.on('scale',  Wams.predefined.scales.view());
app.on('drag',   Wams.predefined.drags.itemsAndView(['card']));
app.on('layout', handleLayout);

app.listen(9001);

