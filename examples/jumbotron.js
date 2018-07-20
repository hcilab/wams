/*
 * This example is intended to demonstrate having multiple users move their
 *  viewer around in a shared space.
 */

'use strict';

const WAMS = require('../src/server');

const workspace = new WAMS.WorkSpace(
  9000,
  {
    bounds: {
      x: 4000,
      y: 4000,
    },
    clientLimit: 4,
  }
);
workspace.addItem(new WAMS.Item(
  0,
  0,
  workspace.width,
  workspace.height,
  'mona',
  {
    imgsrc: 'monaLisa.png'
  }
));

// Takes in the target that was dragged on and who caused the drag event
const handleDrag = function(target, client, x, y, dx, dy) {
  // 'view/background' is the type if your drag isn't on any items
  if (target.type === 'view/background') { 
    target.moveBy(dx, dy);
  } else if (target.type === 'mona') { 
    // We can check if target was our custom type,
    //  still just want to move the client anyway
    client.moveBy(dx, dy);
  }
}

// Example Layout function that takes in the newly added client and which 
//  workspace they joined.
// Lays out views in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  function getMove(num_views, prev_viewer) {
    if (num_views % 2 === 0) { 
      return {
        x: prev_viewer.right() - 10;
        y: prev_viewer.top();
      };
    }
    return {
      x: prev_viewer.left();
      y: prev_viewer.bottom() - 10;
    };
  }

  function handleLayout(workspace, client) {
    const otherViews = workspace.views;
    const num_views = otherViews.length;
    
    if (num_views > 0) {
      const prev_viewer = otherViews[num_views - 1];
      const move = getMove(num_views, prev_viewer);
      client.moveTo(move.x, move.y);
    }
  }

  return handleLayout;
})();

// Handle Scale, uses the built in viewer method rescale
const handleScale = function(vs, newScale) {
  vs.rescale(newScale);
}

workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);
workspace.attachScaleHandler(handleScale);

workspace.listen();

