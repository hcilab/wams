/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

function square(x, y, view) {
  return Wams.predefined.items.square(-64, -64, 128, 
    Wams.colours[view.id % Wams.colours.length], 
    {
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale,
      rotation: view.rotation,
    }
  );
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, square, 'colour'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.view(ws));

ws.listen(9002);

