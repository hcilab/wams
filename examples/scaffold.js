// Includes the Wams API
const Wams = require('..');
const app = new Wams.Application();

function randomOffset() {
  return Math.floor(Math.random() * 200) * (Math.random() < 0.5 ? -1 : 1);
}

function multiplySquare(event) {
  const { x, y } = event;
  const xOffset = randomOffset(); 
  const yOffset = randomOffset();

  app.spawnItem(Wams.predefined.items.square(x + xOffset, y + yOffset, 100, 'blue', {
    ondrag: Wams.predefined.drag,
    onclick: multiplySquare,
  }))
}

app.spawnItem(Wams.predefined.items.square(200, 200, 100, 'green', {
  ondrag: Wams.predefined.drag,
  onclick: multiplySquare,
}));


app.listen(8080);
