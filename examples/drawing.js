/*
 * This is a simple example showing how users can interact with a shared set
 *  of objects.
 */

'use strict';

const WAMS = require('../src/server');

const workspace = new WAMS.WorkSpace(
  9002, 
  {
    debug: false, 
    BGcolor: '#aaaaaa'
  }
);

workspace.addWSObject(new WAMS.WSObject(
  32, 
  32, 
  128, 
  128,
  'color', 
  {
    imgsrc: 'red.png'
  }
));

const handleLayout = function(workspace, user) {
  // Executed once every time a new user joins
  const users = workspace.users;
  if (users.length > 1) {
    user.moveTo(workspace.getCenter().x, workspace.getCenter().y);
  }
}

// Executed every time a user taps or clicks a screen
const handleClick = (function makeClickHandler(workspace) {
  const sources = [
    'blue.png',
    'red.png',
    'green.png',
    'pink.png',
    'cyan.png',
    'yellow.png',
  ];

  function square(x, y, index) {
    return new WAMS.WSObject(
      x - 64, 
      y - 64, 
      128, 
      128, 
      'color', 
      {
        imgsrc: sources[index]
      }
    );
  }

  function handleClick(target, user, x, y) {
    if (target.type === 'color') {
      workspace.removeWSObject(target);
    } else {
      workspace.addWSObject(square(x, y, user.id % 6));
    }
  }

  return handleClick;
})(workspace);

// Executed every time a drag occurs on a device
function handleDrag(target, user, x, y, dx, dy) {
  if (target.type === 'color') {
    target.moveBy(-dx, -dy);
  } else if (target.type === 'view/background') {
    target.moveBy(dx, dy);
  }
}

// Executed when a user pinches a device, or uses the scroll wheel on a computer
function handleScale(user, newScale) {
  user.rescale(newScale);
}

// Attaches the defferent function handlers
workspace.attachClickHandler(handleClick);
workspace.attachScaleHandler(handleScale);
workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);

workspace.listen();

