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
 * Actually returns an express.js app with routes already established. Maybe not
 * the most elegant solution, but it means the end user can access the router,
 * and the main routes will still get priority.
 *
 * @memberof module:server
 */
class Router {
  constructor() {
    const app = express();

    // Establish main routes.
    const view   = path.join(__dirname, '../../dist/view.html');
    const source = path.join(__dirname, '../../dist/wams-client.js');
    app.get('/',               (req, res) => res.sendFile(view)  );
    app.get('/wams-client.js', (req, res) => res.sendFile(source));

    // Make the express object accessible (e.g. for express.static())
    app.express = express;

    return app;
  }
}

module.exports = Router;

