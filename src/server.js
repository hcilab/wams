/**
 * Bundles together the server API endpoint, the Application class, with the
 * Router class for custom route generation.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams.wiki/master/graphs/server.png"
 * style = "max-height: 260px;"
 * >
 *
 * @module server
 */

'use strict';

const Router = require('./server/Router.js');
const Application = require('./server/Application.js');

module.exports = {
  Application,
  Router,
};
