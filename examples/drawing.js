/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

const colours = [
  'saddlebrown',
  'red',
  'blue',
  'darkgreen',
  'orangered',
  'purple',
  'aqua',
  'lime',
];

function square2(x, y, view) {
  return Wams.predefined.items.polygon([
      { x: -64, y: -64 },
      { x: 64, y: -64 },
      { x: 64, y: 64 },
      { x: -64, y: 64 },
    ], 
    colours[view.id % colours.length],
    {
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale,
      rotation: view.rotation,
    }
  );
}

function square(x, y, view) {
  return Wams.predefined.items.square(128, colours[view.id % colours.length], {
    // x: ix - 64,
    // y: iy - 64,
    x,
    y,
    type: 'colour',
    scale: 1 / view.scale,
    rotation: view.rotation,
  });
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, square2, 'colour'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.view(ws));

ws.listen(9002);

