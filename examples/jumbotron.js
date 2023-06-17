/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */
'use strict';

const path = require('path');
const WAMS = require('..');

const { image } = WAMS.predefined.items;

const router = WAMS.predefined.routing.router();
const imagePath = path.join(__dirname, 'img');
WAMS.predefined.routing.addStaticDirectory(router, imagePath);

const app = new WAMS.Application(
  {
    color: 'black',
    clientLimit: 1000,
  },
  router
);

const scale = 2;

const lisa = app.spawn(
  image('monaLisa.jpg', {
    width: 1200,
    height: 1815,
    x: 0,
    y: 0,
    type: 'item/image',
    scale,
  })
);
lisa.on('drag', WAMS.predefined.actions.drag);
lisa.on('pinch', WAMS.predefined.actions.pinch);
lisa.on('rotate', WAMS.predefined.actions.rotate);

const jumbotronLayout = jumbotron(1200 * scale);

function handleConnect({ view }) {
  jumbotronLayout(view);
}

app.on('connect', handleConnect);
app.listen(9000);

/**
 * Generates a handler that places devices in a jumbotron.
 * (see junkyard jumbotron)
 *
 * @param {number} width
 */
function jumbotron(width) {
  const jumbotronWidth = width;
  const views = [];
  let coveredWidth = 0;
  let coveredHeight = 0;
  let currentRowHeight = 0;

  function layout(view) {
    if (views[view.index] !== undefined) {
      view.moveTo(views[view.index].x, views[view.index].y);
      return;
    }
    if (coveredWidth >= jumbotronWidth) moveToNextRow(view);
    view.moveTo(coveredWidth, coveredHeight);
    views[view.index] = { x: coveredWidth, y: coveredHeight };
    coveredWidth += view.width;
    currentRowHeight = Math.max(view.height, currentRowHeight);
  }

  function moveToNextRow(view) {
    coveredWidth = 0;
    coveredHeight += currentRowHeight;
    currentRowHeight = view.height;
  }

  return layout;
}
