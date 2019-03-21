/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function element(x, y, view) {
  return Wams.predefined.items.wrappedElement(
    '<button onclick="alert(\'You panicked :\(\')">dont panic</button>',
    300,
    50,
    {
      x,
      y,
      width: 300,
      height: 50,
      type:  'button',
      scale: 1 / view.scale,
      rotation: view.rotation,
    }
  );
}

// Attaches the different function handlers
app.on('scale',  Wams.predefined.scales.itemsAndView(['button']));
app.on('drag',   Wams.predefined.drags.itemsAndView(['button']));
app.on('rotate', Wams.predefined.rotates.itemsAndView(['button']));
app.on(
  'click',
  Wams.predefined.taps.spawnOrRemoveItem(app, element, 'button', 'spawnElement')
);

app.listen(9002);

