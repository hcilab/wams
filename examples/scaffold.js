'use strict';

// Scaffold example for Wams

// Includes the Wams API
const Wams = require("../src/server");
const ws = new Wams();

const handleLayout = function(view, numViews) {
  // Executed once every time a new user joins
}

const handleClick = function(view, target, x, y) {
  // Executed every time a user taps or clicks a screen
}

const handleDrag = function(view, target, x, y, dx, dy) {
  // Executed every time a drag occurs on a device 
}

const handleScale = function(view, scale, mx, my) {
  // Executed when a user pinches a device, or uses the scroll wheel on a
  // computer
}

// Attaches the defferent function handlers
ws.on('click',  handleClick);
ws.on('drag',   handleDrag);
ws.on('scale',  handleScale);
ws.on('layout', handleLayout);

// Once all the handlers are attached, open up the workspace and listen for
// connections.
ws.listen(9004);

