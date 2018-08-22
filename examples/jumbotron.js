/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */

'use strict';

const Wams = require('../src/server');
const ws = new Wams({
  bounds: { x: 4000, y: 4000 },
  clientLimit: 4,
});

ws.spawnItem({
  x: 0,
  y: 0,
  width: 4000,
  height: 4000,
  type: 'mona',
  imgsrc: 'img/monaLisa.png'
});

// Takes in the target that was dragged on and who caused the drag event
const handleDrag = function(view, target, x, y, dx, dy) {
  view.moveBy(-dx, -dy);
  ws.update(view);
}

// Example Layout function that takes in the newly added client and which 
//  ws they joined.
// Lays out views in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  function getMove(view, index) {
    const olap = 30;
    let move;
    switch (index % 3) {
      case 0: move = { x: view.right - olap, y: view.top };           break;
      case 1: move = { x: view.left,         y: view.bottom - olap }; break;
      case 2: move = { x: view.right - olap, y: view.bottom - olap }; break;
    }
    return move;
  }

  function handleLayout(view, position) {
    if (position > 0) {
      const move = getMove(view, position);
      view.moveTo(move.x, move.y);
      ws.update(view);
    }
  }

  return handleLayout;
})();

// Handle Scale, uses the built in view method rescale
const handleScale = function(view, newScale) {
  view.rescale(newScale);
  ws.update(view);
}

ws.on('drag',   handleDrag);
ws.on('layout', handleLayout);
ws.on('scale',  handleScale);

ws.listen(9000);

