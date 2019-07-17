/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */

'use strict';

const Wams = require('..');
const { image } = Wams.predefined.items;

const app = new Wams.Application({
  clientLimit: 1000,
  staticDir: path.join(__dirname, './img'),
});

app.spawn(image('monaLisa.jpg', {
  width: 1200,
  height: 1815,
  x: 0,
  y: 0,
  type: 'mona',
  scale: .5,
}));

function handleConnect(view) {
  view.onscale = Wams.predefined.scale;
  view.ondrag = Wams.predefined.drag;
  view.onrotate = Wams.predefined.rotate;
}

app.onconnect(handleConnect);
app.listen(9010);

