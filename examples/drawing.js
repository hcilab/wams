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

function square(ix, iy, index) {
  return Wams.predefined.items.square(128, colours[index % colours.length], {
    x: ix - 64,
    y: iy - 64,
    type: 'colour'
  });
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, square, 'colour'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.view(ws));

ws.listen(9002);

