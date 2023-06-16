'use strict';

// External modules
const os = require('os');

/**
 * Server routing utilities.
 *
 * @namespace routing
 * @memberof module:predefined
 */

/**
 * @memberof module:predefined.routing
 *
 * @returns {string} The first valid local non-internal IPv4 address it finds.
 */
function getLocalIP() {
  for (const networkInterface of Object.values(os.networkInterfaces())) {
    for (const networkAddress of networkInterface) {
      if (networkAddress.family === 'IPv4' && networkAddress.internal === false) {
        return networkAddress.address;
      }
    }
  }
  return null;
}

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
  // Establish router for predefined staticfiles
  const app = express();
  app.use('/', express.static(path.join(__dirname, 'staticfiles')));
  app.use('/', express.static(path.join(__dirname, '..', '..', 'dist', 'wams')));
  return app;
}

module.exports = {
  getLocalIP,
  Router,
};
