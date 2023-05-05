/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const http = require('http');
const Router = require('./Router.js');
const WAMS = require('..');

const expressApp = Router();
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
server.listen(9000, () => {
  console.log(server);
  const formatAddress = (_host, port) => `http://${_host}:${port}`;
  const { address, port } = server.address();

  console.log('🚀 WAMS server listening on:');
  console.log(`🔗 ${formatAddress(address, port)}`);

  // if host is localhost or '0.0.0.0', assume local ipv4 also available
  // if (host === '0.0.0.0' || host == 'localhost') {
  //   const localIPv4 = getLocalIP();
  //   console.log(`🔗 ${formatAddress(localIPv4, port)}`);
  // }
});
