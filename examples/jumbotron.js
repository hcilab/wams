/*
 * This example is intended to demonstrate having multiple users move their
 *  viewer around in a shared space.
 */

'use strict';

const WAMS = require('../src/server');
const ws = new WAMS.WamsServer({
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
const handleDrag = function(viewer, target, x, y, dx, dy) {
  viewer.moveBy(-dx, -dy);
  ws.update(viewer);
}

// Example Layout function that takes in the newly added client and which 
//  ws they joined.
// Lays out viewers in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  function getMove(num_viewers, viewer) {
    if (num_viewers % 2 === 0) { 
      return {
        x: viewer.right - 10,
        y: viewer.top,
      };
    }
    return {
      x: viewer.left,
      y: viewer.bottom - 10,
    };
  }

  function handleLayout(viewer, numViewers) {
    if (numViewers > 0) {
      const move = getMove(numViewers, viewer);
      viewer.moveTo(move.x, move.y);
      ws.update(viewer);
    }
  }

  return handleLayout;
})();

// Handle Scale, uses the built in viewer method rescale
const handleScale = function(viewer, newScale) {
  viewer.rescale(newScale);
  ws.update(viewer);
}

ws.on('drag',   handleDrag);
ws.on('layout', handleLayout);
ws.on('scale',  handleScale);

ws.listen(9000);

