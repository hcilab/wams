/*
 * Utilities for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 * Although this file was originally authored by Jessie Rolheiser and Scott
 *  Bateman, those contents have been entirely removed and replaced with the
 *  below set of utilities and classes for use by both the client and the
 *  server, in order to provide a common interface.
 */

/*
 * This object stores a set of core utilities for use by both the client and
 *  the server.
 */
const WamsShared = (function defineSharedWamsModule() {
  const constants = {
    EVENT_DC_USER: 'wams-disconnect',
    EVENT_INIT:  'wams-initialize',
    EVENT_RM_USER: 'wams-remove-user',
    EVENT_UD_OBJS: 'wams-update-objects',
    EVENT_UD_USER: 'wams-update-user',
    MSG_LAYOUT:  'wams-layout',
  };

  const NOP = () => {};

  /*
   * This method will set an already-existing property on an object to be 
   *  immutable. In other words, it will configure it as such:
   *
   *    configurable: false
   *    writable: false
   *
   * It will have no effect on non-configurable properties, and will turn an 
   *  accessor descriptor  a data descriptor. (I.e. if the property is 
   *  defined with getters and setters, they will be lost).  
   *
   * It will have no effect on properties that do not exist directly on the
   *  Object (properties further up the prototype chain are not affected).
   *
   * It will affect both enumerable and non-enumerable properties.
   *
   * This method is intended for use when the only reason for a call to
   *  Object.defineProperty() was to make the property immutable.
   *
   * Returns the modified object.
   */
  function makeOwnPropertyImmutable(obj, prop) {
    const desc = Object.getOwnPropertyDescriptor(obj, prop);
    if (desc && desc.configurable) {
      Object.defineProperty(obj, prop, {
        configurable: false,
        writable: false
      });
    }
    return obj;
  }

  /*
   * Returns a new object, with all the own properties of 'defaults' having
   *  values from 'data', if found, otherwise with values from 'defaults'.
   */
  function initialize(defaults = {}, data = {}) {
    const rv = {};
    Object.keys(defaults).forEach( k => {
      rv[k] = data.hasOwnProperty(k) ? data[k] : defaults[k];
    });
    return rv;
  }

  /*
   * I wrote this generator class to make ID generation more controlled.
   * The class has access to a private (local lexical scope) generator 
   *  function and Symbol for generators, and exposes a stamp() method that 
   *  stamps an immutable ID onto the given object. 
   *
   * stamp(object [,id]):
   *  This method takes one or two arguments:
   *  object:   The object to stamp with an id.
   *  id:     [optional]
   *        If provided, will stamp the given ID onto the object.
   *        If not provided, the stamper will generate an ID to use.
   *
   *  WARNING:  IDs from a stamper are not guaranteed to be unique if it is
   *        ever explicitly provided an ID with which to stamp an 
   *        object.
   *
   * For example:
   *  
   *    const stamper = new IDStamper();
   *    const obj = {};
   *    stamper.stamp(obj);
   *    console.log(obj.id); // an integer unique to IDs stamped by stamper
   *    obj.id = 2;      // has no effect.
   *    delete obj.id;     // false
   *
   *    const danger = {};
   *    stamper.stamp(danger, obj.id);  // Will work. 'danger' & 'obj' are
   *                    // now both using the same ID.
   */
  const IDStamper = (function defineIDStamper() {
    function* id_gen() {
      function willNotOverflow(x) {
        return x + 1 > x;
      }

      let next_id = 0;
      while (willNotOverflow(next_id)) yield ++next_id;
    }
    const gen = Symbol();

    class IDStamper {
      constructor() {
        this[gen] = id_gen();
      }

      stamp(obj, id) {
        Object.defineProperty(obj, 'id', {
          value: id === undefined ? this[gen].next().value : id,
          configurable: false,
          enumerable: true,
          writable: false
        });
        return obj.id;
      }
    }

    return IDStamper;
  })();

  /*
   * The IDStamper can be outside the factory, because it only ever does
   * copy stamping, it never generates its own stamps.
   */
  const stamper = new IDStamper();

  /*
   * This factory can generate the basic classes that need to communicate
   *  property values between the client and server.
   */
  function reporterClassFactory(_coreProperties) {
    const defaults = {};
    _coreProperties.forEach( p => {
      Object.defineProperty(defaults, p, {
        value: null,
        writable: false,
        enumerable: true,
        configurable: false
      });
    });

    class Reporter {
      constructor(data) {
        return this.assign(initialize(defaults, data));
      }

      assign(data) {
        _coreProperties.forEach( p => {
          if (data.hasOwnProperty(p)) this[p] = data[p] 
        });
        return this;
      }

      report() {
        const data = {};
        _coreProperties.forEach( p => data[p] = this[p] );
        if (this.hasOwnProperty('id')) stamper.stamp(data, this.id);
        return data; 
      }
    }

    return Reporter;
  }

  /*
   * This ViewSpace class provides a common interface between the client and 
   * the server by which the ViewSpaces can interact safely.
   */
  const ViewSpace = reporterClassFactory([
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
   * This WSObject class provides a common interface between the client and 
   * the server by which the WSObjects can interact safely.
   */
  const WSObject = reporterClassFactory([
    'x',
    'y',
    'width',
    'height',
    'type',
    'imgsrc',
    'drawCustom',
    'drawStart',
  ]);

  /*
   * Package up the module and freeze it for delivery.
   */
  return Object.freeze({
    constants,
    IDStamper,
    initialize,
    makeOwnPropertyImmutable,
    NOP,
    ViewSpace,
    WSObject,
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

