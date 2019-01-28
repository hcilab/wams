/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

console.log(Wams);

function randomPoints(x = 5, lim = 256) {
  const points = [{x: 0, y: 0}];
  const offset = lim / 2;
  for (let i = 1; i < x; ++i) {
    points.push({
      x: Math.random() * lim - offset,
      y: Math.random() * lim - offset,
    });
  }
  return points;
}

function polygon(x, y, view) {
  return Wams.predefined.items.polygon(
    randomPoints(7),
    Wams.colours[view.id % Wams.colours.length],
    { 
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale 
    }
  );
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, polygon, 'colour'));
ws.on('scale',  Wams.predefined.scale.itemsAndView(ws, ['colour']));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.itemsAndView(ws, ['colour']));

ws.listen(9002);

