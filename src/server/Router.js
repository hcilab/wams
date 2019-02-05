/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const path = require('path');
const express = require('express');

/**
 * This function wraps a layer of abstraction around the route handler. It will
 * set up the main routes for a WAMS app before returning, so that those routes
 * will get priority.
 *
 * @memberof module:server
 */
function Router() {
  const app = express();

  // Establish main routes.
  const view   = path.join(__dirname, '../../dist/view.html');
  const source = path.join(__dirname, '../../dist/wams-client.js');
  app.get('/',               (req, res) => res.sendFile(view));
  app.get('/wams-client.js', (req, res) => res.sendFile(source));

  // Make the express object accessible (e.g. for express.static())
  app.express = express;

  return app;
}

module.exports = Router;

