/*
 * Utilities for the WAMS application.
 *
 * XXX: I think these are only intended for use inside the view.
 *      I'll have to dig around and see if that's correct.
 *
 *      The presence of HTMLCanvasElement suggests that's correct...
 *
 *      Looking at this, I'm thinking it might be possible to eliminate this
 *      file, although it might also be useful to keep around for adding
 *      functionality in, so I probably will keep it. I've been known to
 *      maintain a 'utils' file in my other projects...
 */

/*
 * I wrote this generator class to make ID generation more controlled.
 * The class has access to a private (local lexical scope) generator function
 *  and Symbol for generators, and exposes a stamp() method that stamps an
 *  immutable ID onto the given object.
 *
 * For example:
 *  
 *      const stamper = new IDStamper();
 *      const obj = {};
 *      stamper.stamp(obj);
 *      console.log(obj.id); // an integer unique to IDs stamped by stamper.
 *      obj.id = 2;          // has no effect.
 *      delete obj.id;       // false
 */
const IDStamper = (function defineIDStamper() {
    function* id_gen() {
        let id = 0;
        while (1) yield ++id;
    }
    const sym = Symbol('generator');

    class IDStamper {
        constructor() {
            this[sym] = id_gen();
        }

        stamp(obj) {
            Object.defineProperty(obj, 'id', {
                value: this[sym].next().value,
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

