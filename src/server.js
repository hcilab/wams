/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/**
 * Bundles together the server API endpoint, the Application class, with the
 * Router class for custom route generation.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams/master/graphs/
 * server.png"
 * style = "max-height: 260px;"
 * >
 *
 * @module server
 */

'use strict';

const Router      = require('./server/Router.js');
const Application = require('./server/Application.js');

module.exports = {
  Application,
  Router,
};

