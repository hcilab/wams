'use strict';

// Scaffold example for Wams

// Includes the Wams API
const Wams = require('..');
const app = new Wams.Application();

function handleLayout(view, position, device) {
  // Executed once every time a new user joins
}

function handleClick(view, target, x, y) {
  // Executed every time a user taps or clicks a screen
}

function handleDrag(view, target, x, y, dx, dy) {
  // Executed every time a drag occurs on a device
}

function handleRotate(view, target, radians, x, y) {
  // Executed every time a multitouch rotate is detected, or if a desktop user
  // holds CTRL while holding down the mouse button and dragging.
}

function handleScale(view, target, scale, x, y) {
  // Executed when a user pinches a device, or uses the scroll wheel on a mouse.
}

// Attaches the defferent function handlers
app.on('click',  handleClick);
app.on('drag',   handleDrag);
app.on('rotate', handleRotate);
app.on('scale',  handleScale);
app.on('layout', handleLayout);

// Once all the handlers are attached, open up the workspace and listen for
// connections.
app.listen(8080);

