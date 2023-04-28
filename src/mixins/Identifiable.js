'use strict';

const { IdStamper } = require('../shared.js');
const STAMPER = new IdStamper();

/**
 * Labels each instantiated object with a unique, immutable ID. All classes that
 * use this mixin will share the same pool of IDs.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Identifiable = (superclass) =>
  class Identifiable extends superclass {
    constructor(...args) {
      super(...args);

      /**
       * Id to make Identifiables uniquely identifiable.
       *
       * @name id
       * @type {number}
       * @constant
       * @memberof module:mixins.Identifiable
       */
      STAMPER.stampNewId(this);
    }
  };

module.exports = Identifiable;
