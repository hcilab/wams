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
 * This method on the Object class will set an already-existing property on an
 *  object to be immutable. In other words, it will configure it as such:
 *
 *      configurable: false
 *      writable: false
 *
 * It will have no effect on non-configurable properties, and will turn an
 *  accessor descriptor into a data descriptor. (I.e. if the property is
 *  defined with getters and setters, they will be lost). 
 *
 * It will have no effect on properties that do not exist directly on the
 *  Object (properties further up the prototype chain are not affected).
 *
 * It will affect both enumerable and non-enumerable properties.
 *
 * This method is intended for use when the only reason for a call to
 *  Object.defineProperty() was to make the property immutable.
 */
if (!Object.makeOwnPropertyImmutable) {
    Object.makeOwnPropertyImmutable = function(obj, prop) {
        const desc = Object.getOwnPropertyDescriptor(obj, prop);
        if (desc && desc.configurable) {
            Object.defineProperty(obj, prop, {
                configurable: false,
                writable: false
            });
        }       
    }
} else {
    console.warn(
        'Object.makePropertyImmutable method collision.\n' +
        'Program may behave unexpectedly.'
    );
}

/*
 * I wrote this generator class to make ID generation more controlled.
 * The class has access to a private (local lexical scope) generator function
 *  and Symbol for generators, and exposes a stamp() method that stamps an
 *  immutable ID onto the given object. 
 *
 * stamp(object [,id]):
 *  This method takes one or two arguments:
 *  object:     The object to stamp with an id.
 *  id:         [optional]
 *              If provided, will stamp the given ID onto the object.
 *              If not provided, the stamper will generate an ID to use.
 *
 *  WARNING:    IDs from a stamper are not guaranteed to be unique if it is
 *              ever explicitly provided an ID with which to stamp an object.
 *
 * For example:
 *  
 *      const stamper = new IDStamper();
 *      const obj = {};
 *      stamper.stamp(obj);
 *      console.log(obj.id); // an integer unique to IDs stamped by stamper.
 *      obj.id = 2;          // has no effect.
 *      delete obj.id;       // false
 *
 *      const danger = {};
 *      stamper.stamp(danger, obj.id);  // Will work. 'danger' and 'obj' are
 *                                      // now both using the same ID.
 */
const IDStamper = (function defineIDStamper() {
    function* id_gen() {
        let next_id = 0;
        while (1) yield ++next_id;
    }
    const sym = Symbol('generator');

    class IDStamper {
        constructor() {
            this[sym] = id_gen();
        }

        stamp(obj, id) {
            Object.defineProperty(obj, 'id', {
                value: id === undefined ? this[sym].next().value : id,
                configurable: false,
                enumerable: true,
                writable: false
            });
        }
    }

    return IDStamper;
})();

/*
 * This ViewSpace class provides a common interface between the client and the
 *  server by which the ViewSpaces can interact safely.
 */
const ViewSpace = (function defineViewSpace() {
    const _coreProperties = [
        'x',
        'y',
        'width',
        'height',
        'effectiveWidth',
        'effectiveHeight',
        'scale',
        'rotation',
    ];

    class ViewSpace {
        constructor() {
            _coreProperties.forEach( p => this[p] = 0 );
            this.scale = 1;
        }

        assign(data) {
            _coreProperties.forEach( p => this[p] = data[p] );
        }

        retrieve() {
            const data = {};
            _coreProperties.forEach( p => data[p] = this[p] );
            return data; 
        }
    }

    return ViewSpace;
})();

/*
 * Conditionally export this file if we are running server-side with node.js
 *
 * XXX: Look into JS Modules. How do they work, and how widely supported are
 *      they?
 */
if (typeof exports !== 'undefined') {
    exports.IDStamper = IDStamper;
    exports.ViewSpace = ViewSpace;
}

