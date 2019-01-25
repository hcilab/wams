/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const path = require('path');
const Wams = require('../src/server');

const router = new Wams.RequestHandler();
const images = path.join(__dirname, '../img');
router.use('/img', router.express.static(images));

const ws = new Wams({
  bounds: { x: 7000, y: 7000 },
  color: 'green',
  clientLimit: 5,
}, router);

const circle = new Wams.Sequence();
circle.beginPath();
// circle.arc( '{x}', '{y}', '{height}', Math.PI, 0, false);
circle.arc(0, 0, 150, Math.PI, 0, false);
circle.closePath();
circle.fillStyle = 'white';
circle.fill();
circle.lineWidth = 5;
circle.strokeStyle = '#003300';
circle.stroke();

ws.spawnItem({
  x: 2500,
  y: 2500,
  type: 'circle',
  blueprint: circle,
});

const text = new Wams.Sequence();
text.font = 'normal 36px Times,serif';
text.fillStyle = '#1a1a1a';
text.fillText( 'Click the joker!', 0, 0);

ws.spawnItem({
  x: 2380,
  y: 2480,
  type: 'text',
  blueprint: text,
});

ws.spawnItem(Wams.predefined.items.image('img/joker.png', {
  x: 2600,
  y: 2800,
  type: 'joker',
  scale: 1.5,
}));

const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const TABLE   = 0;
  const BOTTOM  = 1;
  const LEFT    = 2;
  const TOP     = 3;
  const RIGHT   = 4;

  function layoutTable(view) {
    view.moveTo( 2000, 2000 );
    table = view;
    ws.update(view);
  };

  function layoutBottom(view) {
    const anchor = table.bottomLeft;
    view.moveTo( anchor.x, anchor.y );
  };

  function layoutLeft(view) {
    const anchor = table.topLeft;
    view.moveTo( anchor.x, anchor.y );
    view.rotateBy(Math.PI * 3 / 2);
  };

  function layoutTop(view) {
    const anchor = table.topRight;
    view.moveTo( anchor.x, anchor.y );
    view.rotateBy(Math.PI);
  };

  function layoutRight(view) {
    const anchor = table.bottomRight;
    view.moveTo( anchor.x, anchor.y );
    view.rotateBy(Math.PI / 2);
  };

  function dependOnTable(fn) {
    return function layoutDepender(view) {
      if (!table) {
        // console.log('dodged!!!');
        setTimeout( () => layoutDepender(view), 0 ); 
      } else {
        fn(view);
        ws.update(view);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[BOTTOM]  = dependOnTable( layoutBottom );
  user_fns[LEFT]    = dependOnTable( layoutLeft );
  user_fns[TOP]     = dependOnTable( layoutTop );
  user_fns[RIGHT]   = dependOnTable( layoutRight );

  function handleLayout(view, position) {
    user_fns[position](view);
  }

  return handleLayout;
})();

let faceUp = true;
function flipCard(card) {
  const imgsrc = faceUp ? 'img/card-back.png' : 'img/joker.png';
  card.assign({imgsrc});
  faceUp = !faceUp;
}
 
ws.on('click',  Wams.predefined.tap.modifyItem(ws, flipCard, 'joker'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['joker']));
ws.on('layout', handleLayout);

ws.listen(9001);

// const second_ws = new Wams.WorkSpace(
//   9501,
//   {
//     debug : false,
//     BGcolor: 'blue',
//     bounds: {
//       x: 1000,
//       y: 1000,
//     },
//     clientLimit: 5, // 4 players plus one for the table
//   }
// );
// main_ws.addSubWS(second_ws);

