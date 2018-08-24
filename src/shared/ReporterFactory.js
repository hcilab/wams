/*
 * Builds Reporter classes for the WAMS application.
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

const STAMPER = new IdStamper();

/*
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 */
function ReporterFactory(coreProperties) {
  const KEYS = Object.freeze(Array.from(coreProperties));

  const INITIALIZER = {};
  coreProperties.forEach( p => {
    defineOwnImmutableEnumerableProperty(INITIALIZER, p, null);
  });
  Object.freeze(INITIALIZER);

  class Reporter {
    constructor(data) {
      return this.assign(getInitialValues(INITIALIZER, data));
    }

    assign(data = {}) {
      KEYS.forEach( p => { 
        if (data.hasOwnProperty(p)) this[p] = data[p]; 
      });
    }

    report() {
      const data = {};
      KEYS.forEach( p => data[p] = this[p] );
      STAMPER.cloneId(data, this.id);
      return data; 
    }
  }

  return Reporter;
}

module.exports = ReporterFactory;

