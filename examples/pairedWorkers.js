/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const Wams = require('..');
const { image } = Wams.predefined.items;

const app = new Wams.Application({
  clientLimit: 2,
  __dirname,
});

app.spawn(image('./img/scream.png', {
  x: 400,
  y: 400,
  width: 800,
  height: 1013,
  scale: 0.25,
  ondrag: Wams.predefined.drag,
  onrotate: Wams.predefined.rotate,
  onscale: Wams.predefined.scale,
}));

app.spawn(image('./img/monaLisa.jpg', {
  x: 200,
  y: 200,
  width: 1200,
  height: 1815,
  scale: 0.2,
  ondrag: Wams.predefined.drag,
  onrotate: Wams.predefined.rotate,
  onscale: Wams.predefined.scale,
}));

app.listen(9003);

