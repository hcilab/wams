/*
 * Utilities for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 *  The below set of utilities and classes are intended for use by both the
 *  client and the server, in order to provide a common interface.
 */

'use strict';

const IdStamper = require('./IdStamper.js');
const Message = require('./Message.js');
const Utils = require('./util.js');

/*
 * This object stores a set of core utilities for use by both the client and
 *  the server.
 */
const WamsShared = (function defineSharedWamsModule() {
  const constants = Object.freeze({
    // General constants
    ROTATE_0:   0,
    ROTATE_90:  Math.PI / 2,
    ROTATE_180: Math.PI,
    ROTATE_270: Math.PI * 1.5,

    // Namespaces
    NS_WAMS:  '/wams',
  });

  /*
   * Package up the module and freeze it for delivery.
   */
  return Object.freeze({
    constants,
    findLast,
    FullStateReporter,
    IdStamper,
    getInitialValues,
    Item,
    makeOwnPropertyImmutable,
    defineOwnImmutableEnumerableProperty,
    Message,
    MouseReporter,
    NOP,
    removeById,
    RotateReporter,
    ScaleReporter,
    View,
  });
})();

/*
 * Conditionally export this file if we are running server-side with node.js.
 * Exporting in this manner lets the server side use whichever name for the 
 * module that they prefer.
 *
 * XXX: Look into JS Modules. How do they work, and how widely supported are
 *    they?
 */
if (typeof exports !== 'undefined') {
  Object.keys(WamsShared).forEach( k => exports[k] = WamsShared[k] );
}

