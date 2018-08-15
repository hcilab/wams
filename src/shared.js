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

'use strict';

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

  const NOP = () => {};

  const Message = (function defineMessage() {
    const locals = (function defineLocals() {
      const TYPES = Object.freeze({ 
        // For the server to inform about changes to the model
        ADD_ITEM:   'wams-add-item',
        ADD_SHADOW: 'wams-add-shadow',
        RM_ITEM:    'wams-remove-item',
        RM_SHADOW:  'wams-remove-shadow',
        UD_ITEM:    'wams-update-item',
        UD_SHADOW:  'wams-update-shadow',
        UD_VIEWER:  'wams-update-viewer',

        // Connection establishment related (disconnect, initial setup)
        INITIALIZE: 'wams-initialize',
        LAYOUT:     'wams-layout',

        // User event related
        CLICK:      'wams-click',
        DRAG:       'wams-drag',
        RESIZE:     'wams-resize',
        ROTATE:     'wams-rotate',
        SCALE:      'wams-scale',
      });
      const TYPE_VALUES = Object.freeze(Object.values(TYPES));

      return Object.freeze({
        TYPES,
        TYPE_VALUES,
      });
    })();

    class Message {
      constructor(type, reporter) {
        if (!locals.TYPE_VALUES.includes(type)) {
          throw 'Invalid message type!';
        }
        this.type = type;
        this.reporter = reporter;
      }

      emitWith(emitter) {
        // console.log('emitting:', this.type, this.reporter.report());
        emitter.emit(this.type, this.reporter.report());
      }
    }

    Object.entries(locals.TYPES).forEach( ([p,v]) => {
      Object.defineProperty( Message, p, {
        value: v,
        configurable: false,
        enumerable: true,
        writable: false,
      });
    });

    return Message;
  })();

  /*
   * Returns a new object, with all the own properties of 'defaults' having
   *  values from 'data', if found, otherwise with values from 'defaults'.
   */
  function getInitialValues(defaults = {}, data = {}) {
    const rv = {};
    Object.keys(defaults).forEach( k => {
      rv[k] = data.hasOwnProperty(k) ? data[k] : defaults[k];
    });
    return rv;
  }

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

  function defineOwnImmutableEnumerableProperty(obj, prop, val) {
    Object.defineProperty(obj, prop, {
      value: val,
      configurable: false,
      enumerable: true,
      writable: false
    });
  }

  /*
   * Removes the given item from the given array, according to its ID.
   */
  function removeByID(array, item) {
    const idx = array.findIndex( o => o.id === item.id );
    if (idx >= 0) {
      array.splice(idx, 1);
      return true;
    }
    return false;
  }

  /*
   * Removes the given item of the given class (enforced by throwing an
   * exception if not an instance) from the given array.
   */
  function safeRemoveByID(array, item, class_fn) {
    if (!(item instanceof class_fn)) throw `Invalid ${class_fn} received.`;
    return removeByID(array, item);
  }

  /*
   * I wrote this generator class to make ID generation more controlled.
   * The class has access to a private (local lexical scope) generator 
   *  function and Symbol for generators, and exposes a pair of methods for
   *  stamping new IDs onto objects and cloning previously existing IDs onto
   *  objects.
   *
   * stampNewId(object):
   *  object:   The object to stamp with an id.
   *
   *  All IDs produced by this method are guaranteed to be unique, on a
   *  per-stamper basis. (Two uniquely constructed stampers can and will
   *  generate identical IDs).
   *
   * cloneId(object, id):
   *  object:   Will receive a cloned id.
   *  id:       The id to clone onto the object.
   *
   * For example:
   *    const stamper = new IDStamper();
   *    const obj = {};
   *    stamper.stampNewId(obj);
   *    console.log(obj.id);  // an integer unique to IDs stamped by stamper
   *    obj.id = 2;           // has no effect.
   *    delete obj.id;        // false
   *
   *    const danger = {};
   *    stamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
   *                                     // now both using the same ID.
   */
  const IDStamper = (function defineIDStamper() {
    function* id_gen() {
      let next_id = 0;
      while (Number.isSafeInteger(next_id + 1)) yield ++next_id;
    }
    const gen = Symbol();

    class IDStamper {
      constructor() {
        this[gen] = id_gen();
      }

      stampNewId(obj) {
        defineOwnImmutableEnumerableProperty(obj, 'id', this[gen].next().value);
      }

      cloneId(obj, id) {
        if (Number.isSafeInteger(id)) {
          defineOwnImmutableEnumerableProperty(obj, 'id', id);
        }
      }
    }

    return IDStamper;
  })();

  /*
   * This factory can generate the basic classes that need to communicate
   *  property values between the client and server.
   */
  function reporterClassFactory(coreProperties) {
    const locals = Object.freeze({
      DEFAULTS: {},
      STAMPER: new IDStamper(),
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
   * This Viewer class provides a common interface between the client and 
   * the server by which the Viewers can interact safely.
   */
  const Viewer = reporterClassFactory([
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
    'viewers',
    'items',
    'color',
    'id',
  ]);

  /*
   * Package up the module and freeze it for delivery.
   */
  return Object.freeze({
    constants,
    FullStateReporter,
    IDStamper,
    getInitialValues,
    Item,
    makeOwnPropertyImmutable,
    defineOwnImmutableEnumerableProperty,
    Message,
    MouseReporter,
    NOP,
    removeByID,
    RotateReporter,
    ScaleReporter,
    Viewer,
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

