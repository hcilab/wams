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
 * XXX: Wait... are these really necessary? Why are we accessing the window's
 *      innerWidth instead of the canvas element's innerWidth? Does the canvas
 *      element even have an innerWidth? I'll look into it...
 */
HTMLCanvasElement.prototype.getWidth = function() {
    return window.innerWidth;
};

HTMLCanvasElement.prototype.getHeight = function() {
    return window.innerHeight;
};

HTMLCanvasElement.prototype.getCenter = function(){
    return {
        x : this.getWidth()/2,
        y : this.getHeight()/2
    };
}

