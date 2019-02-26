/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application({ 
  clientLimit: 4,
  useServerGestures: true, 
});

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
    Wams.colours[Math.floor(Math.random() * Wams.colours.length)],
    { 
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale 
    }
  );
}

// Example Layout function that takes in the newly added client and which 
//  app they joined. Lays out views in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  let table = null;
  const OVERLAP = 30;

  const TABLE   = 0;
  const RIGHT   = 1;
  const LEFT    = 2;
  const BOTTOM  = 3;

  function layoutTable(view) {
    table = view;
  };

  function layoutLeft(view) {
    const anchor = table.bottomLeft.minus({ x: 0, y: OVERLAP });
    view.moveTo( anchor.x, anchor.y );
  };

  function layoutRight(view) {
    const anchor = table.topRight.minus({ x: OVERLAP, y: 0 });
    view.moveTo( anchor.x, anchor.y );
  };

  function layoutBottom(view) {
    const anchor = table.bottomRight.minus({ x: OVERLAP, y: OVERLAP });
    view.moveTo( anchor.x, anchor.y );
  };

  function dependOnTable(fn) {
    return function layoutDepender(view) {
      if (!table) {
        setTimeout( () => layoutDepender(view), 0 ); 
      } else {
        fn(view);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[RIGHT]   = dependOnTable( layoutRight );
  user_fns[LEFT]    = dependOnTable( layoutLeft );
  user_fns[BOTTOM]  = dependOnTable( layoutBottom );

  function handleLayout(view, position) {
    user_fns[position](view);
  }

  return handleLayout;
})();

// Attaches the different function handlers
app.on('layout', handleLayout);
app.on('scale',  Wams.predefined.scales .itemsAndView(app, ['colour']));
app.on('drag',   Wams.predefined.drags  .itemsAndView(app, ['colour']));
app.on('rotate', Wams.predefined.rotates.itemsAndView(app, ['colour']));
app.on('click',  
  Wams.predefined.taps.spawnOrRemoveItem(app, polygon, 'colour')
);

app.listen(9002);

