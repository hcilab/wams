/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const path = require('path');
const Wams = require('../src/server');

const router = new Wams.Router();
const images = path.join(__dirname, '../img');
router.use('/img', router.express.static(images));

const ws = new Wams({ clientLimit: 2 }, router);

ws.spawnItem(Wams.predefined.items.image('img/monaLisa.jpg', {
  x: 200, 
  y: 200, 
  type: 'Draggable',
  scale: 0.2
}));

ws.spawnItem(Wams.predefined.items.image('img/scream.png', {
  x: 400, 
  y: 400,
  type: 'Draggable',
  scale: 0.25
}));

const handleLayout = (function defineLayoutHandler() {
  let nx = 0;
  function handleLayout(view, position) {
    if (position === 0) {
      nx = view.topRight;
      nx.x -= 30;
    } else {
      view.moveTo( nx.x, nx.y ); 
    } 
  }
  return handleLayout;
})();

ws.on('drag',   Wams.predefined.drags.items(ws, ['Draggable']));
ws.on('layout', handleLayout);

ws.listen(9003);

