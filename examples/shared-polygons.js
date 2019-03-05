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

// Example Layout function that takes in the newly added client and which app
//  they joined. Lays out views in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const OVERLAP = 30;

  const TABLE   = 0;
  const RIGHT   = 1;
  const LEFT    = 2;
  const BOTTOM  = 3;

  function layoutTable(view) {
    table = view;
  }

  function transform(point) {
    return table.transformPointChange(point.x, point.y);
  }

  function layoutLeft(view, device) {
    const anchor = table.bottomLeft.minus(transform({
      x: 0,
      y: OVERLAP,
    }));
    view.moveTo(anchor.x, anchor.y);
    device.moveTo(0, table.height - OVERLAP);
  }

  function layoutRight(view, device) {
    const anchor = table.topRight.minus(transform({
      x: OVERLAP,
      y: 0,
    }));
    view.moveTo(anchor.x, anchor.y);
    device.moveTo(table.width - OVERLAP, 0);
  }

  function layoutBottom(view, device) {
    const anchor = table.bottomRight.minus(transform({
      x: OVERLAP,
      y: OVERLAP,
    }));
    view.moveTo(anchor.x, anchor.y);
    device.moveTo(table.width - OVERLAP, table.height - OVERLAP);
  }

  function dependOnTable(fn) {
    return function layoutDepender(view, device) {
      if (table == null) {
        setTimeout(() => layoutDepender(view, device), 0);
      } else {
        fn(view, device);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[RIGHT]   = dependOnTable(layoutRight);
  user_fns[LEFT]    = dependOnTable(layoutLeft);
  user_fns[BOTTOM]  = dependOnTable(layoutBottom);

  function handleLayout(view, position, device) {
    user_fns[position](view, device);
  }

  return handleLayout;
}());

// Attaches the different function handlers
app.on('layout', handleLayout);
app.on('scale',  Wams.predefined.scales.itemsAndView(['colour']));
app.on('drag',   Wams.predefined.drags.itemsAndView(['colour']));
app.on('rotate', Wams.predefined.rotates.itemsAndView(['colour']));
app.on(
  'click',
  Wams.predefined.taps.spawnOrRemoveItem(app, polygon, 'colour')
);

app.listen(9002);

