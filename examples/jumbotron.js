/*
 * This example is intended to demonstrate having multiple users move their
 *  view around in a shared space.
 */
'use strict';

const path = require('path');
const WAMS = require('..');

const { image } = WAMS.predefined.items;

const app = new WAMS.Application({
  color: 'black',
  clientLimit: 1000,
  staticDir: path.join(__dirname, './img'),
});

const scale = 1;

app.spawn(image('monaLisa.jpg', {
  width: 1200,
  height: 1815,
  x: 0,
  y: 0,
  type: 'mona',
  scale,
  allowDrag: true,
  allowScale: true,
  allowRotate: true
}));

const jumbotronLayout = jumbotron(1200 * scale);

function handleConnect(view) {
  jumbotronLayout(view);
}

app.onconnect(handleConnect);
app.listen(9010);

/**
 * Generates a handler that places devices in a jumbotron.
 * (see junkyard jumbotron)
 *
 * @param {number} width
 */
function jumbotron(width) {
  const jumbotronWidth = width;
  const views          = [];
  let coveredWidth     = 0;
  let coveredHeight    = 0;
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