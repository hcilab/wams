/**
 * Simple example to demonstrate the use of external client side libraries with WAMS
 * This uses the dollar sign recognizer and papers.js. Currently works in Firefox.
 * Left click to start drawing a gesture, draw a rectangle, right click to end, a stroke is created with paper.js
 */
'use strict';

const WAMS = require('..');
const path = require('path');
const app = new WAMS.Application({
  clientScripts: [
    'https://code.jquery.com/jquery-1.12.4.js',
    'https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js',
    'dollar.js',
    'paper.js',
  ],
  staticDir: path.join(__dirname, './client'),
});

function handleConnect({ view }) {
  view.onpinch = WAMS.predefined.actions.pinch;
  view.ondrag = WAMS.predefined.actions.drag;
  view.onrotate = WAMS.predefined.actions.rotate;
}
app.onconnect = handleConnect;
app.listen(9013);
