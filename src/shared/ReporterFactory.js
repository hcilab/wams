'use strict';

const IdStamper = require('./IdStamper.js');

/**
 * This factory can generate the basic classes that need to communicate
 *  property values between the client and server.
 *
 * @memberof module:shared
 * @param {object} coreProperties - It is the properties defined on this object,
 * and only these properties, which will be reported by the reporter. The values
 * provided will be used as the defaults.
 */
function ReporterFactory(coreProperties) {
  const INITIALIZER = Object.freeze({ ...coreProperties });
  const KEYS = Object.freeze(Object.keys(INITIALIZER));

  /**
   * A Reporter regulates communication between client and server by enforcing a
   * strict set of rules over what data can be shared for the given class.
   *
   * @memberof module:shared
   *
   * @param {Object} data - Data to store in the reporter. All own properties of
   * 'data' will be transferred. Additionally, the prototype chain of 'data'
   * will be searched for the core properties of this Reporter.
   */
  class Reporter {
    constructor(data) {
      // Merge the defaults with all the own enumerable properties of 'data'
      // onto the new instance.
      Object.assign(this, INITIALIZER, data);

      // Special access for coreProperties existing anywhere up the prototype
      // chain of 'data'.
      this.assign(data);
    }

    /**
     * Save onto this Reporter instance the values in data which correspond to
     * its core properties. Searches the prototype chain of 'data'.
     *
     * @param {Object} data - Data values to attempt to save.
     */
    assign(data = {}) {
      KEYS.forEach((p) => {
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
      KEYS.forEach((p) => {
        data[p] = this[p];
      });
      IdStamper.cloneId(data, this.id);
      return data;
    }
  }

  // Expose the default settings onto the return class object.
  Reporter.DEFAULTS = Object.freeze({ ...coreProperties });

  return Reporter;
}

module.exports = ReporterFactory;
