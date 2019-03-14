/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application({
  clientLimit:       4,
  useServerGestures: true,
});

function randomPoints(x = 5, lim = 256) {
  const points = [{ x: 0, y: 0 }];
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
    Wams.colours[Math.floor(Math.random() * Wams.colours.length)],
    {
      x,
      y,
      type:  'colour',
      scale: 1 / view.scale,
    }
  );
}

// Attaches the different function handlers
app.on('layout', Wams.predefined.layouts.line(5));
app.on('scale',  Wams.predefined.scales.itemsAndView(['colour']));
app.on('drag',   Wams.predefined.drags.itemsAndView(['colour']));
app.on('rotate', Wams.predefined.rotates.itemsAndView(['colour']));
app.on(
  'click',
  Wams.predefined.taps.spawnOrRemoveItem(app, polygon, 'colour')
);

app.listen(9002);

