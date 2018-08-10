/*
 * This example is intended to demonstrate how users can coordinate with the
 * workspace from several different angles.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer({
  bounds: { x: 5000, y: 5000 },
  color: 'green',
  clientLimit: 5,
});

ws.spawnItem({
  x: 100, 
  y: 200, 
  type: 'joker',
  imgsrc: 'img/joker.png',
});

const seq = new WAMS.Sequence();
seq.beginPath();
seq.arc( 400, 250, 150, Math.PI, false);
seq.lineTo( 250, 250 );
seq.fillStyle = 'white';
seq.fill();
seq.lineWidth = 5;
seq.strokeStyle = '#003300';
seq.stroke();
seq.font = 'normal 36px Times,serif';
seq.fillStyle = '#000000';
seq.fillText( 'Click the joker!', 275, 225 );

ws.spawnItem({
  x: 250,
  y: 250,
  width: 100, 
  height: 100,
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

  function layoutTable(viewer) {
    viewer.moveTo( 250, 250 );
    table = viewer;
  };

  function layoutBottom(viewer) {
    viewer.moveTo( table.left, table.bottom );
  };

  function layoutLeft(viewer) {
    viewer.rotation = Math.PI;
    viewer.moveTo( table.left, table.top - viewer.effectiveHeight );
  };

  function layoutTop(viewer) {
    viewer.rotation = Math.PI * 3 / 2;
    viewer.moveTo( table.left - viewer.effectiveWidth, table.top );
  };

  function layoutRight(viewer) {
    viewer.rotation = Math.PI / 2;
    viewer.moveTo( table.right, table.top );
  };

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[BOTTOM]  = layoutBottom;
  user_fns[LEFT]    = layoutLeft;
  user_fns[TOP]     = layoutTop;
  user_fns[RIGHT]   = layoutRight;

  function handleLayout(viewer, numViewers) {
    if (numViewers <= 5 && numViewers >= 0) {
      user_fns[numViewers - 1](viewer);
      ws.update(viewer);
    }
  }

  return handleLayout;
})();

const handleDrag = (function makeDragHandler() {
  function isItem(tgt) {
    return tgt.type === 'joker';
  }

  function handleDrag(viewer, target, x, y, dx, dy) {
    if (target.type === 'view/background') {
      target.moveBy(-dx, -dy);  
    } else if (isItem(target)) {
      target.moveBy(dx, dy);
    }
    ws.update(target);
  }

  return handleDrag;
})();

const handleScale = function(viewer, newScale) {
  viewer.rescale(newScale);
  ws.update(viewer);
}

const handleClick = (function makeClickHandler() {
  let faceUp = true;

  function handleClick(viewer, target, x, y) {
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

