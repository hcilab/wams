/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
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

workspace.addItem(new WAMS.Item(
  32, 
  32, 
  128, 
  128,
  'color', 
  {
    imgsrc: 'red.png'
  }
));

const handleLayout = function(workspace, viewer) {
  // Executed once every time a new user joins
  const viewers = workspace.viewers;
  if (viewers.length > 1) {
    viewer.moveTo(workspace.getCenter().x, workspace.getCenter().y);
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
    return new WAMS.Item(
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

  function handleClick(target, viewer, x, y) {
    if (target.type === 'color') {
      workspace.removeItem(target);
    } else {
      workspace.addItem(square(x, y, viewer.id % 6));
    }
  }

  return handleClick;
})(workspace);

// Executed every time a drag occurs on a device
function handleDrag(target, viewer, x, y, dx, dy) {
  if (target.type === 'color') {
    target.moveBy(-dx, -dy);
  } else if (target.type === 'view/background') {
    target.moveBy(dx, dy);
  }
}

// Executed when a user pinches a device, or uses the scroll wheel on a computer
function handleScale(viewer, newScale) {
  viewer.rescale(newScale);
}

// Attaches the defferent function handlers
workspace.attachClickHandler(handleClick);
workspace.attachScaleHandler(handleScale);
workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);

workspace.listen();

