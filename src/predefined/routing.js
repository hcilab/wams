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

module.exports = {
  getLocalIP,
};
