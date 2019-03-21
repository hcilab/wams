/*
 * Builds Reporter classes for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const IdStamper = require('./IdStamper.js');

const STAMPER = new IdStamper();

/**
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 *
 * @memberof module:shared
 * @param {object} coreProperties - It is the properties defined on this object,
 * properties, and only these properties, which will be report()ed by the
 * reporter. The values provided will be used as the defaults.
 */
function ReporterFactory(coreProperties) {
  const INITIALIZER = Object.freeze({ ...coreProperties });
  const KEYS = Object.freeze(Object.keys(INITIALIZER));

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
      // Grab all own enumerable properties of 'data'.
      Object.assign(this, INITIALIZER, data);

      // Special access for coreProperties existing anywhere up the prototype
      // chain of 'data'.
      this.assign(data);
    }

    /**
     * Save onto this Reporter instance the values in data which correspond to
     * properties named in KEYS.
     *
     * @param {Object} data - Data values to attempt to save.
     */
    assign(data = {}) {
      KEYS.forEach(p => {
        if (p in data) this[p] = data[p];
      });
    }

    /**
     * Provide a report of the data saved in this Reporter instance. Only those
     * instance properties which correspond to core properties will be reported.
     *
     * @return {Object} Contains the core properties of this Reporter instance.
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

