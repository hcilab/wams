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
   * This factory can generate the basic classes that need to communicate
   *  property values between the client and server.
   */
  function reporterClassFactory(coreProperties) {
    const locals = Object.freeze({
      DEFAULTS: {},
      STAMPER: new IdStamper(),
    });

    coreProperties.forEach( p => {
      defineOwnImmutableEnumerableProperty(locals.DEFAULTS, p, null);
    });

    class Reporter {
      constructor(data) {
        return this.assign(getInitialValues(locals.DEFAULTS, data));
      }

      assign(data = {}) {
        coreProperties.forEach( p => {
          if (data.hasOwnProperty(p)) this[p] = data[p] 
        });
        return this;
      }

      report() {
        const data = {};
        coreProperties.forEach( p => data[p] = this[p] );
        locals.STAMPER.cloneId(data, this.id);
        return data; 
      }
    }

    return Reporter;
  }

  /*
   * This Item class provides a common interface between the client and 
   * the server by which the Items can interact safely.
   */
  const Item = reporterClassFactory([
    'x',
    'y',
    'width',
    'height',
    'type',
    'imgsrc',
    'blueprint',
  ]);

  /*
   * This View class provides a common interface between the client and 
   * the server by which the Views can interact safely.
   */
  const View = reporterClassFactory([
    'x',
    'y',
    'width',
    'height',
    'type',
    'effectiveWidth',
    'effectiveHeight',
    'scale',
    'rotation',
  ]);

  /*
   * This class is intended for sharing mouse action data between client and
   * server.
   */
  const MouseReporter = reporterClassFactory([
    'x',
    'y',
    'dx',
    'dy',
  ]);

  /*
   * This class allows reporting of scale data between client and server.
   */
  const ScaleReporter = reporterClassFactory([
    'scale',
  ]);

  /*
   * This class allows reporting of rotation data between client and server.
   */
  const RotateReporter = reporterClassFactory([
    'radians',
  ]);

  /*
   * This class allows reporting of the full state of the model, for bringing
   * new clients up to speed (or potentially also for recovering a client, if
   * need be).
   */
  const FullStateReporter = reporterClassFactory([
    'views',
    'items',
    'color',
    'id',
  ]);

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

