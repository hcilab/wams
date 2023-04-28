'use strict';

const path = require('path');
const express = require('express');

/**
 * This function wraps a layer of abstraction around the route handler. It will
 * set up the main routes for a WAMS app before returning, so that those routes
 * will get priority.
 *
 * @memberof module:server
 *
 * @return {express.app} An express app with main WAMS routes established.
 */
function Router() {
  const app = express();

  // Establish main routes.
  const view = path.join(__dirname, '../../dist/index.html');
  app.get('/', (req, res) => res.sendFile(view));

  app.use('/wams', express.static(path.join(__dirname, '../../dist/wams')));

  // Make the express object accessible (e.g. for express.static())
  app.express = express;

  return app;
}

module.exports = Router;
