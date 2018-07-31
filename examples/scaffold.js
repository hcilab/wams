'use strict';

// Scaffold example for WAMS
//TODO: make sure the WAMS.js conforms to this scaffold, 
//    examples made need to be update

// Includes the WAMS API
const WAMS = require("../src/server");
const ws = new WAMS.WamsServer();

const handleLayout = function(viewer, numViewers) {
  // Executed once every time a new user joins
}

const handleClick = function(viewer, target, x, y) {
  // Executed every time a user taps or clicks a screen
}

const handleDrag = function(viewer, target, x, y, dx, dy) {
  // Executed every time a drag occurs on a device 
}

const handleScale = function(viewer, scale) {
  // Executed when a user pinches a device, or uses the scroll wheel on a computer
}

// Attaches the defferent function handlers
ws.on('click',  handleClick);
ws.on('drag',   handleDrag);
ws.on('scale',  handleScale);
ws.on('layout', handleLayout);

// Once all the handlers are attached, open up the workspace and listen for
// connections.
workspace.listen(9004);

