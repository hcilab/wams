/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

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
app.on('layout', Wams.predefined.layouts.placeAtXY(app, 4000, 4000));
app.on('click',  Wams.predefined.taps.spawnOrRemoveItem(app, square, 'colour'));
app.on('scale',  Wams.predefined.scales.view(app));
app.on('drag',   Wams.predefined.drags.itemsAndView(app, ['colour']));
app.on('rotate', Wams.predefined.rotates.view(app));

app.listen(9002);

