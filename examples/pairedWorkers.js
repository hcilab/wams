/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const Wams = require('../src/server');

const ws = new Wams({ clientLimit: 2 });

ws.spawnItem({
  x: 200, y: 200, width: 180, height: 196.5,
  type: 'Draggable',
  imgsrc: 'img/monaLisa.png',
});

ws.spawnItem({
  x: 400, y: 400, width: 160, height: 200,
  type: 'Draggable',
  imgsrc: 'img/scream.png'
});

const handleLayout = (function defineLayoutHandler() {
  let nx = 0;
  function handleLayout(view, position) {
    if (position === 0) {
      nx = view.right - 30;
    } else {
      view.moveTo( nx, view.top ); 
      ws.update(view);
    } 
  }
  return handleLayout;
})();

ws.on('drag',   Wams.predefined.drag.items(ws, ['Draggable']));
ws.on('layout', handleLayout);

ws.listen(9003);

