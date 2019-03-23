/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */

'use strict';

const path = require('path');
const Wams = require('..');

const router = new Wams.Router();
const images = path.join(__dirname, '../img');
router.use('/img', router.express.static(images));

const app = new Wams.Application({ clientLimit: 20 }, router);

app.spawnImage({
  width:  1200,
  height: 1815,
  src:    'img/monaLisa.jpg',
  type:   'mona',
  scale:  5,
});

function handleLayout(view) {
  view.onscale = Wams.predefined.scale;
  view.ondrag = Wams.predefined.drag;
  view.onrotate = Wams.predefined.rotate;
}

app.onlayout(handleLayout);
app.listen(9000);

