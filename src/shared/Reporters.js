/*
 * Reporters for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const IdStamper = require('./IdStamper.js');
const { 
  defineOwnImmutableEnumerableProperty,
  getInitialValues,
} = require('./util.js');

/*
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 */
function ReporterClassFactory(coreProperties) {
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
const Item = ReporterClassFactory([
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
const View = ReporterClassFactory([
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
const MouseReporter = ReporterClassFactory([
  'x',
  'y',
  'dx',
  'dy',
]);

/*
 * This class allows reporting of scale data between client and server.
 */
const ScaleReporter = ReporterClassFactory([
  'scale',
]);

/*
 * This class allows reporting of rotation data between client and server.
 */
const RotateReporter = ReporterClassFactory([
  'radians',
]);

/*
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 */
const FullStateReporter = ReporterClassFactory([
  'views',
  'items',
  'color',
  'id',
]);

module.exports = {
  Item,
  View,
  MouseReporter,
  ScaleReporter,
  RotateReporter,
  FullStateReporter,
};

