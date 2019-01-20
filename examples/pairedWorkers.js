/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const Wams = require('../src/server');

const ws = new Wams({ clientLimit: 2 });

ws.spawnItem(Wams.predefined.items.image(0, 0, 'img/monaLisa.jpg', {
  x: 200, 
  y: 200, 
  type: 'Draggable',
  scale: 0.2
}));

ws.spawnItem(Wams.predefined.items.image(0, 0, 'img/scream.png', {
  x: 400, 
  y: 400,
  type: 'Draggable',
  scale: 0.25
}));

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

