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
    randomPoints(7),
    colours[index % colours.length],
    { x: ix, y: iy, type: 'colour' }
  );
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, polygon, 'colour'));
ws.on('scale',  Wams.predefined.scale.itemsAndView(ws, ['colour']));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.itemsAndView(ws, ['colour']));

ws.listen(9002);

