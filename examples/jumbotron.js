/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
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
workspace.addWSObject(new WAMS.WSObject(
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
  // 'view/background' is the type if your drag isn't on any objects
  if (target.type === 'view/background') { 
    target.move(dx, dy);
  } else if (target.type === 'mona') { 
    // We can check if target was our custom type,
    //  still just want to move the client anyway
    client.move(dx, dy);
  }
}

// Example Layout function that takes in the newly added client and which 
//  workspace they joined.
// Lays out users in a decending staircase pattern
const handleLayout = (function makeLayoutHandler() {
  function getMove(num_users, prev_user) {
    if (num_users % 2 === 0) { 
      return {
        x: prev_user.right() - 10;
        y: prev_user.top();
      };
    }
    return {
      x: prev_user.left();
      y: prev_user.bottom() - 10;
    };
  }

  function handleLayout(workspace, client) {
    const otherUsers = workspace.users;
    const num_users = otherUsers.length;
    
    if (num_users > 0) {
      const prev_user = otherUsers[num_users - 1];
      const move = getMove(num_users, prev_user);
      client.moveToXY(move.x, move.y);
    }
  }

  return handleLayout;
})();

// Handle Scale, uses the built in viewspace method rescale
const handleScale = function(vs, newScale) {
  vs.rescale(newScale);
}

workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);
workspace.attachScaleHandler(handleScale);

workspace.listen();

