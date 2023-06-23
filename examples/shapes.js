/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  shadows: true,
  status: true,
});

function properties(x, y, view) {
  return {
    x,
    y,
    scale: 1 / view.scale,
    rotation: view.rotation,
  };
}

function line(x, y, view) {
  return WAMS.predefined.items.line(82, 0, 30, WAMS.colours[view.id % WAMS.colours.length], properties(x, y, view));
}

function rectangle(x, y, view) {
  return WAMS.predefined.items.rectangle(75, 100, WAMS.colours[view.id % WAMS.colours.length], properties(x, y, view));
}

function square(x, y, view) {
  return WAMS.predefined.items.square(50, WAMS.colours[view.id % WAMS.colours.length], properties(x, y, view));
}

function circle(x, y, view) {
  return WAMS.predefined.items.circle(50, WAMS.colours[view.id % WAMS.colours.length], properties(x, y, view));
}

function oval(x, y, view) {
  return WAMS.predefined.items.oval(50, 75, WAMS.colours[view.id % WAMS.colours.length], properties(x, y, view));
}

function polygon(x, y, view) {
  return WAMS.predefined.items.polygon(
    WAMS.predefined.utilities.randomPoints(7), // random coordinates
    WAMS.colours[view.id % WAMS.colours.length], // colour based on view id
    properties(x, y, view)
  );
}

const SHAPES = [line, rectangle, square, circle, oval, polygon];

function removeItem(event) {
  app.removeItem(event.target);
}

function spawnItem(event) {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const item = app.spawn(shape(event.x, event.y, event.view));
  item.on('click', removeItem);
  item.on('pinch', WAMS.predefined.actions.pinch);
  item.on('rotate', WAMS.predefined.actions.rotate);
  item.on('drag', WAMS.predefined.actions.drag);
}

function handleConnect({ view }) {
  view.on('click', spawnItem);
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('rotate', WAMS.predefined.actions.rotate);
  view.on('drag', WAMS.predefined.actions.drag);
}

app.on('connect', handleConnect);
app.listen(9000);
