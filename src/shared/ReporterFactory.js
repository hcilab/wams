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
  mergeMatches,
} = require('./util.js');

const STAMPER = new IdStamper();

/**
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 *
 * coreProperties: An array of property names. It is these properties, and only
 *                 these properties, which will be report()ed by the reporter.
 */
function ReporterFactory(coreProperties) {
  // Use scoping to permanently save the list of core property names. Make sure
  // To create a local copy and freeze it to guarantee immutability as best
  // JavaScript will allow. If a better method for ensuring immutability is
  // Available, use it here instead.
  const KEYS = Object.freeze(Array.from(coreProperties));

  // Generate a default initial object containing all the core properties, each
  // With a value of null.
  const INITIALIZER = {};
  coreProperties.forEach(p => {
    defineOwnImmutableEnumerableProperty(INITIALIZER, p, null);
  });
  Object.freeze(INITIALIZER);

  /**
   * A Reporter regulates communication between client and server by enforcing a
   * strict set of rules over what data can be shared for the given class.
   *
   * @memberof module:shared
   */
  class Reporter {
    /**
     * @param {Object} data - data to store in the reporter. Only properties
     * with keys matching those provided in coreProperties and saved in KEYS
     * will be accepted.
     */
    constructor(data) {
      return this.assign(mergeMatches(INITIALIZER, data));
    }

    /**
     * Save onto this Reporter instance the values in data which correspond to
     * properties named in KEYS.
     *
     * data: Data values to attempt to save.
     */
    assign(data = {}) {
      KEYS.forEach(p => {
        if (data.hasOwnProperty(p)) this[p] = data[p];
      });
    }

    /**
     * Provide a report of the data saved in this Reporter instance. Only those
     * instance properties which correspond to properties named in KEYS will be
     * reported.
     */
    report() {
      const data = {};
      KEYS.forEach(p => {
        data[p] = this[p];
      });
      STAMPER.cloneId(data, this.id);
      return data;
    }
  }

  return Reporter;
}

module.exports = ReporterFactory;

