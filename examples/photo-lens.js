/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */
'use strict';

const path = require('path');
const WAMS = require('..');

const { image } = WAMS.predefined.items;

const router = WAMS.predefined.routing.router();
const imagePath = path.join(__dirname, 'img');
WAMS.predefined.routing.addStaticDirectory(router, imagePath);

const app = new WAMS.Application(
  {
    shadows: true,
    color: 'white',
  },
  router
);

app.spawn(
  image('scream.png', {
    width: 800,
    height: 1013,
    x: 0,
    y: 0,
  })
);

function handleConnect({ view }) {
  view.on('rotate', WAMS.predefined.actions.rotate);
  if (view.index > 0) {
    view.scale = 2.5;
    view.on('drag', WAMS.predefined.actions.drag);
    view.on('pinch', WAMS.predefined.actions.pinch);
  }
}

app.on('connect', handleConnect);
app.listen(9000);
