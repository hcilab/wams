/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer({
  bounds: { x: 7000, y: 7000 },
  color: 'green',
  clientLimit: 5,
});

ws.spawnItem({
  x: 2600, 
  y: 2800, 
  type: 'joker',
  imgsrc: 'img/joker.png',
});

const seq = new WAMS.Sequence();
seq.beginPath();
seq.arc( '{x}', '{y}', '{height}', Math.PI * 2, 0, false);
seq.fillStyle = 'white';
seq.fill();
seq.lineWidth = 5;
seq.strokeStyle = '#003300';
seq.stroke();
seq.font = 'normal 36px Times,serif';
seq.fillStyle = '#1a1a1a';
seq.fillText( '  Click the joker!', '{x}', '{y}');

ws.spawnItem({
  x: 2500,
  y: 2500,
  width: 150, 
  height: 150,
  type: 'text',
  blueprint: seq,
});

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
  };

  function layoutBottom(view) {
    view.moveTo( table.left, table.bottom );
    view.rotation = Math.PI * 1 / 4;
  };

  function layoutLeft(view) {
    view.moveTo( table.left, table.top );
    view.rotation = Math.PI * 3 / 2;
  };

  function layoutTop(view) {
    view.moveTo( table.right, table.top );
    view.rotation = Math.PI;
  };

  function layoutRight(view) {
    view.moveTo( table.right, table.bottom );
    view.rotation = Math.PI / 2;
  };

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[BOTTOM]  = layoutBottom;
  user_fns[LEFT]    = layoutLeft;
  user_fns[TOP]     = layoutTop;
  user_fns[RIGHT]   = layoutRight;

  function handleLayout(view, viewIndex) {
    user_fns[viewIndex](view);
    ws.update(view);
  }

  return handleLayout;
})();

const handleDrag = (function makeDragHandler() {
  function isItem(tgt) {
    return tgt.type === 'joker';
  }

  function handleDrag(view, target, x, y, dx, dy) {
    if (target.type === 'view/background') {
      target.moveBy(-dx, -dy);  
    } else if (isItem(target)) {
      target.moveBy(dx, dy);
    }
    ws.update(target);
  }

  return handleDrag;
})();

const handleScale = function(view, newScale) {
  view.rescale(newScale);
  ws.update(view);
}

const handleClick = (function makeClickHandler() {
  let faceUp = true;

  function handleClick(view, target, x, y) {
    if (target.type === 'joker') {
      const imgsrc = faceUp ? 'img/card-back.png' : 'img/joker.png';
      target.assign({imgsrc});
      faceUp = !faceUp;
      ws.update(target);
    }
  }

  return handleClick;
})();
 
ws.on('click',  handleClick);
ws.on('scale',  handleScale);
ws.on('drag',   handleDrag);
ws.on('layout', handleLayout);

ws.listen(9001);

// const second_ws = new WAMS.WorkSpace(
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

