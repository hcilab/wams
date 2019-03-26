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
 * @module server
 */

'use strict';

const Router      = require('./server/Router.js');
const Application = require('./server/Application.js');

module.exports = {
  Application,
  Router,
};

