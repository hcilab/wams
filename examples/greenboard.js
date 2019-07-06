'use strict';

// Scaffold example for Wams

// Includes the Wams API
const Wams = require('..');
const path = require('path')

const router = new Wams.Router();
const images = path.join(__dirname, '../img/Greenboard');
router.use('/img', router.express.static(images));

const app = new Wams.Application({
  color: '#5B7048',
}, router);

function spawnSticker(e) {
  app.spawnImage(Wams.predefined.items.image('img/sticky-note.png', {
    x: e.x,
    y: e.y,
    width: 1000,
    height: 1000,
    scale: 0.25,
    ondrag: Wams.predefined.drag,
    onrotate: Wams.predefined.rotate,
    onscale: Wams.predefined.scale,
  }));
}

const setLayout = Wams.predefined.layouts.table(100);
function handleLayout(view, position, device) {
  // Executed once every time a new user joins

  if (position === 0) {
    view.onclick = spawnSticker;
  }

  view.ondrag = Wams.predefined.drag
  view.onscale = Wams.predefined.scale

  setLayout(view, position, device)

}

// Open up the workspace and listen for connections.
app.onconnect(handleLayout);
app.listen(8080);

