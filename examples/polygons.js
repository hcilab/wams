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

function randomPoints(x = 5, lim = 256) {
  const points = [{x: 0, y: 0}];
  for (let i = 1; i < x; ++i) {
    points.push({
      x: Math.random() * lim,
      y: Math.random() * lim,
    });
  }
  return points;
}

function polygon(ix, iy, index) {
  return Wams.predefined.items.polygon(
    ix,
    iy,
    randomPoints(7),
    'colour',
    colours[index % colours.length]
  );
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, polygon, 'colour'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.view(ws));

ws.listen(9002);

