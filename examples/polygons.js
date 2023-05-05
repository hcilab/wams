/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');

// Establish server and routing using express
const expressApp = express();
expressApp.use('/', express.static(path.join(__dirname, '../dist')));
const server = http.Server(expressApp);

const app = new WAMS.Application(server, { shadows: true });

function polygon(x, y, view) {
  return WAMS.predefined.items.polygon(
    WAMS.predefined.utilities.randomPoints(7), // random coordinates
    WAMS.colours[view.id % WAMS.colours.length], // random color
    {
      x,
      y,
      type: 'colour',
      scale: 1 / view.scale,
    }
  );
}

function removeItem(event) {
  app.removeItem(event.target);
}

function spawnItem(event) {
  const item = app.spawn(polygon(event.x, event.y, event.view));
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

/**
 * @returns {string} The first valid local IPv4 address it finds.
 */
function getLocalIP() {
  let ipaddr = null;
  Object.values(os.networkInterfaces()).some((f) => {
    return f.some((a) => {
      if (a.family === 'IPv4' && a.internal === false) {
        ipaddr = a.address;
        return true;
      }
      return false;
    });
  });
  return ipaddr;
}


server.listen(9000, () => {
  const formatAddress = (_host, port) => `http://${_host}:${port}`;
  const { address, port } = server.address();
  console.log('🚀 WAMS server listening on:');
  console.log(`🔗 ${formatAddress(address, port)}`);
  console.log(`🔗 ${formatAddress(getLocalIP(), port)}`);
});
