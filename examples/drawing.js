/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('../src/server.js');
const ws = new Wams();

const colours = [
  'blue',
  'red',
  'green',
  'pink',
  'cyan',
  'yellow',
];

function rectSeq(index) {
  const seq = new Wams.Sequence();
  seq.fillStyle = colours[index];
  seq.fillRect('{x}', '{y}', '{width}', '{height}');
  return seq;
}

function square(ix, iy, index) {
  const x = ix - 64;
  const y = iy - 64;
  const width = 128;
  const height = 128;
  const type = 'colour';
  const blueprint = rectSeq(index % 6);
  return {x, y, width, height, type, blueprint};
}

// Attaches the different function handlers
ws.on('layout', Wams.predefined.layout.placeAtXY(ws, 4000, 4000));
ws.on('click',  Wams.predefined.tap.spawnOrRemoveItem(ws, square, 'colour'));
ws.on('scale',  Wams.predefined.scale.view(ws));
ws.on('drag',   Wams.predefined.drag.itemsAndView(ws, ['colour']));
ws.on('rotate', Wams.predefined.rotate.view(ws));

ws.listen(9002);

