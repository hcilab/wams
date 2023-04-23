/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */
'use strict';

const path = require('path');
const WAMS = require('..');

const { image } = WAMS.predefined.items;

const app = new WAMS.Application({
  shadows: true,
  color: 'white',
  staticDir: path.join(__dirname, './img'),
});

app.spawn(
  image('scream.png', {
    width: 800,
    height: 1013,
    x: 0,
    y: 0,
  })
);

function handleConnect({ view }) {
  view.onrotate = WAMS.predefined.actions.rotate;
  if (view.index > 0) {
    view.scale = 2.5;
    view.ondrag = WAMS.predefined.actions.drag;
    view.onpinch = WAMS.predefined.actions.pinch;
  }
}

app.onconnect(handleConnect);
app.listen(9011);
