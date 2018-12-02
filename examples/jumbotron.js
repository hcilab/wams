/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */

'use strict';

const Wams = require('../src/server');
const ws = new Wams({
  bounds: { x: 3600, y: 3970 },
  clientLimit: 4,
});

ws.spawnItem({
  x: 0,
  y: 0,
  width: 3600,
  height: 3970,
  type: 'mona',
  imgsrc: 'img/monaLisa.png'
});

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

ws.on('layout', handleLayout);
ws.on('drag',   Wams.predefined.drag.view(ws));
ws.on('scale',  Wams.predefined.scale.view(ws));

ws.listen(9000);

