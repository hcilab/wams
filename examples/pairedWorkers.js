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

function removeElement(event) {
  app.removeItem(event.target);
}

function spawnCustomItem(event) {
  const HEIGHT = 150
  const WIDTH = 250

  function customItem(x, y, width, height, color) {
    const hitbox = new Wams.Rectangle(width, height, x, y);
    const ondrag = Wams.predefined.drag;
    const onrotate = Wams.predefined.rotate;
    const onclick = removeElement;

    const sequence = new Wams.CanvasSequence();
    sequence.fillStyle = color;
    sequence.shadowBlur = 20;
    sequence.shadowColor = 'black';
    sequence.fillRect(x, y, width, height);

    return { hitbox, sequence, ondrag, onrotate, onclick }
  }
  
  app.spawn(customItem(event.x - HEIGHT / 2, event.y - WIDTH / 2, HEIGHT, WIDTH, 'green'));
}

app.spawn(Wams.predefined.items.image('img/scream.png', {
  x: 400,
  y: 400,
  width: 800,
  height: 1013,
  scale: 0.25,
  ondrag: Wams.predefined.drag,
  onrotate: Wams.predefined.rotate,
  onscale: Wams.predefined.scale,
}));

app.spawn(Wams.predefined.items.image('img/monaLisa.jpg', {
  x: 200,
  y: 200,
  width: 1200,
  height: 1815,
  scale: 0.2,
  ondrag: Wams.predefined.drag,
  onrotate: Wams.predefined.rotate,
  onscale: Wams.predefined.scale,
}));

function handleLayout(view) {
  view.onclick = spawnCustomItem;
}


// app.onconnect(Wams.predefined.layouts.line(30));
app.onconnect(handleLayout)
app.listen(9003);

