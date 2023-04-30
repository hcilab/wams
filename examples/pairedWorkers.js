/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const path = require('path');
const WAMS = require('..');
const { image } = WAMS.predefined.items;

const app = new WAMS.Application({
  clientLimit: 2,
  staticDir: path.join(__dirname, './img'),
});

const scream = app.spawn(
  image('scream.png', {
    x: 400,
    y: 400,
    width: 800,
    height: 1013,
    scale: 0.25,
  })
);
scream.on('drag', WAMS.predefined.actions.drag);
scream.on('rotate', WAMS.predefined.actions.rotate);
scream.on('pinch', WAMS.predefined.actions.pinch);

const lisa = app.spawn(
  image('monaLisa.jpg', {
    x: 200,
    y: 200,
    width: 1200,
    height: 1815,
    scale: 0.2,
  })
);
lisa.on('drag', WAMS.predefined.actions.drag);
lisa.on('rotate', WAMS.predefined.actions.rotate);
lisa.on('pinch', WAMS.predefined.actions.pinch);

app.listen(9000);
