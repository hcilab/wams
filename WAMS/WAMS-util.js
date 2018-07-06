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
 * XXX: Isn't this just a less useful Array.prototype.splice() ???
 *      - Not a criticism, splice() might have been an ES6 addition, and this 
 *          seems to rather neatly achieve some of the functionality of splice, 
 *          though I'm not entirely clear on what the full usage is supposed to
 *          be.
 *      - I think this is going for a python-esque approach to the arguments, 
 *          in that it appears to use negative array indexing to refer to 
 *          indexes from the end of the array. I'm not sure I like this, but
 *          we'll see. If this is only ever used akin to splice() then I'll 
 *          simply replace it with calls to splice().
 */
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

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
            console.log(this);
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

if (typeof exports !== 'undefined') {
    exports.IDStamper = IDStamper;
}

