'use strict';

// Scaffold example for Wams

// Includes the Wams API
const Wams = require('..');
const app = new Wams.Application();

function handleLayout(view, position, device) {
  // Executed once every time a new user joins
}

// Open up the workspace and listen for connections.
app.onlayout(handleLayout);
app.listen(8080);

