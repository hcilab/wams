'use strict';

// Scaffold example for WAMS
//TODO: make sure the WAMS.js conforms to this scaffold, 
//    examples made need to be update

// Includes the WAMS API
const WAMS = require("../src/server");

// Defines a Workspace that will listen on port 3000, takes in optional parameter
const workspace = new WAMS.WorkSpace(
  9500, 
  {
    debug: false, 
    BGcolor: "#aaaaaa"
  }
);

const handleLayout = function(ws, view) {
  // Executed once every time a new user joins
}

const handleClick = function(target, view, x, y) {
  // Executed every time a user taps or clicks a screen
}

const handleDrag = function(target, view, x, y, dx, dy) {
  // Executed every time a drag occurs on a device 
}

const handleScale = function(user, newScale) {
  // Executed when a user pinches a device, or uses the scroll wheel on a computer
}

// Attaches the defferent function handlers
workspace.attachClickHandler(handleClick);
workspace.attachScaleHandler(handleScale);
workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);

// Once all the handlers are attached, open up the workspace and listen for
// connections.
workspace.listen();

