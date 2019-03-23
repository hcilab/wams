/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const path = require('path');
const Wams = require('..');

const router = new Wams.Router();
const images = path.join(__dirname, '../img');
router.use('/img', router.express.static(images));

const app = new Wams.Application({ clientLimit: 2 }, router);

app.spawnImage(Wams.predefined.items.image('img/monaLisa.jpg', {
  x:      200,
  y:      200,
  width:  1200,
  height: 1815,
  scale:  0.2,
  ondrag: Wams.predefined.drag,
}));

app.spawnImage(Wams.predefined.items.image('img/scream.png', {
  x:      400,
  y:      400,
  width:  800,
  height: 1013,
  scale:  0.25,
  ondrag: Wams.predefined.drag,
}));

app.onlayout(Wams.predefined.layouts.line(30));
app.listen(9003);

