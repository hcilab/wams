//TODO: Update canvas to work more like this for drawings: 
// https://simonsarris.com/making-html5-canvas-useful/
//TODO: Stretch goal is to incorporate a canvas library: 
// http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/
//TODO: Allow subcanvas to be drawn on top: 
// https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers

/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Original author: Jesse Rolheiser
 * Revised by: Scott Bateman
 * Latest edition by: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

/*
 * XXX: General TODO list for myself, as part of code cleanup, bringing this
 *      code up to date:
 *
 *      [X] Set to use JavaScript's 'strict' mode.
 *          - Do this last, otherwise there will be problems...
 *      [X] Eliminate all use of 'var', replace with 'const' or 'let'.
 *      [X] Organize globals, eliminate where possible.
 *      [X] Write ID generator factory, use for all IDs.
 *      [X] Switch to using functional style wherever possible, using ES6
 *           standard methods. This should make for more readable code, and
 *           probably faster code too, because the operations will already be
 *           optimized.
 *      [X] Rename variables where appropriate.
 *      [X] Convert all prototype code into ES6 'class' style.
 *          - Better readability, extensibility.
 *      [X] Write a Connection class.
 *      [X] Eliminate use of 'self' variables, use explicit binding.
 *      [X] Look at all interior functions, would they benefit from being
 *           ES6 arrow functions?
 *      [X] Replace classic JS concatenated strings with ES6 backtick strings,
 *           where necessary. (Or everywhere for consistency?)
 *      [X] Switch to using strict equality unless coercive equality is clearly
 *           beneficial in a given circumstance.
 *      [X] Replace all use of the custom Array.prototype.remove() function
 *           with the standard Array.prototype.splice().
 */

/*
 * XXX: BUG! Disconnects aren't actually disconnecting!!!
 */

/*
 * XXX: Look into socket.io 'rooms', as they look like the kind of thing that
 *      might make some of this work a lot easier.
 */
const express = require('express');
const http = require('http');
const io = require('socket.io');
const path = require('path')
const utils = require('./WAMS-util.js');

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
    const constants = {
        EVENT_DC_USER: 'user_disconnect',
        EVENT_RM_USER: 'removeUser',
        EVENT_UD_OBJS: 'updateObjects',
        EVENT_UD_USER: 'updateUser',
        WDEBUG: true,
        OBJ_ID_STAMPER: new utils.IDStamper(),
        VIEW_ID_STAMPER: new utils.IDStamper(),
        WS_ID_STAMPER: new utils.IDStamper(),
    };

    const rv = {};
    Object.entries(constants).forEach( ([p,v]) => {
        Object.defineProperty(rv, p, {
            value: v,
            configurable: false,
            enumerable: true,
            writable: false
        });
    });

    return Object.freeze(rv);
})();

class WorkSpace {
    constructor(port, settings = {debug: false, BGcolor: '#aaaaaa'}) {
        // Data
        this.boundaries = {
            x : 10000,
            y : 10000
        };
        this.clientLimit = 10;
        this.settings = settings;
        globals.WS_ID_STAMPER.stamp(this, port);

        // Things to track.
        this.views = [];
        this.wsObjects = [];
        this.subWS = [];

        /*
         * XXX: Are we sure we want to create the server and listen right away?
         *      Don't we want to wait until the user has had the opportunity to
         *      complete a few more initialization tasks? We can expose a 
         *      function which allows the user to control when these steps 
         *      happen.
         *
         *      This is specifically because we have things set up right now 
         *      such that the user is expected to attach handlers _after_ 
         *      constructing a WorkSpace object. That is to say, _after_ the 
         *      server has already started listening for connections according 
         *      to the current setup.
         */
        this.http = http.createServer(generateRequestHandler());
        this.http.listen(port, get_local_ip(), () => {
            console.log('Listening on', this.http.address());
        });
        this.io = io.listen(this.http);
        this.io.on('connection', (socket) => {new Connection(socket, this);});

        /* ================================================================
         * Some local functions to the constructor. 
         * Still deciding if this is really that good of an idea.
         * ================================================================
         */
        function generateRequestHandler() {
            const app = express();

            // Establish routes.
            app.get('/', (req, res) => {
                res.sendFile(path.resolve('../WAMS/view.html'));
            });
            app.get('/WAMS-util.js', (req, res) => {
                res.sendFile(path.resolve('../WAMS/WAMS-util.js'));
            });
            app.get('/WAMS-view.js', (req, res) => {
                res.sendFile(path.resolve('../WAMS/WAMS-view.js'));
            });

            /* 
             * XXX: express.static() generates a middleware function for 
             *      serving static assets from the directory specified.
             *      - The order in which these functions are registered with
             *          app.use() is important! The callbacks will be triggered
             *          in this order!
             *      - When app.use() is called without a 'path' argument, as it 
             *          is here, it uses the default '/' argument, with the 
             *          result that these callbacks will be executed for 
             *          _every_ request to the app!
             *          + Should therefore consider specifying the path!!
             *      - Should also consider specifying options. Possibly useful:
             *          + immutable
             *          + maxAge
             */
            app.use(express.static(path.resolve('./Images')));
            app.use(express.static(path.resolve('../libs')));

            return app;
        }

        /*
         * XXX: I'd written this in my other project. With this, we can get rid
         *      of the 'ip' dependency.
         */
        function get_local_ip() {
            const os = require('os');

            let ipaddr = null;
            Object.values(os.networkInterfaces()).some( f => {
                return f.some( a => {
                    if (a.family === 'IPv4' && a.internal === false) {
                        ipaddr = a.address;
                        return true;
                    }
                    return false;
                });
            });
            return ipaddr;
        }
    }

    get users() { return this.views; }
    get width() { return this.boundaries.x; }
    get height() { return this.boundaries.y; }

    set width(width) { this.boundaries.x = width; }
    set height(height) { this.boundaries.y = height; }

    /*
     * XXX: Ahh okay, this is where the handlers get attached.
     *      Do we really need separate functions for attaching each one? Would 
     *      it be beneficial to define a single attachHandler function which 
     *      takes an argument describing which handler to attach?
     *      - Also, is there a way to not limit our API like this? What if 
     *          someone making use of it wants to implement other kinds of 
     *          interactions between the users?
     *
     * XXX: Also! These attachHanlder functions can be doing more! We can
     *      probably eliminate all those 'is a handler attached' checks later
     *      if we don't even call the function which calls the handler unless
     *      a handler is attached. Trippy, I know. Something to think about!
     */
    attachDragHandler(func) {
        this.dragHandler = func;
    }

    attachLayoutHandler(func) {
        this.layoutHandler = func;
    }

    attachClickHandler(func) {
        this.clickHandler = func;
    }

    attachScaleHandler(func) {
        this.scaleHandler = func;
    }

    addWSObject(obj) {
        globals.OBJ_ID_STAMPER.stamp(obj);
        this.wsObjects.push(obj);
        if (globals.WDEBUG) { 
            console.log(`Adding object: ${obj.id} (${obj.type})`);
        }
    }

    removeWSObject(obj) {
        const idx = this.wsObjects.findIndex( o => o.id === obj.id );
        if (idx >= 0) {
            if (globals.WDEBUG) {
                console.log(`Removing object: ${obj.id} (${obj.type})`);
            }
            this.wsObjects.splice(idx,1);
        }
    }

    setBoundaries(maxX, maxY) {
        this.boundaries.x = maxX;
        this.boundaries.y = maxY;
    }

    getCenter() {
        return {
            x: this.boundaries.x / 2,
            y: this.boundaries.y / 2
        };
    }

    setClientLimit(maxUsers) {
        this.clientLimit = maxUsers;
    }

    addSubWS(subWS) {
        this.subWS.push(subWS);
        //TODO: add check to make sure subWS is in bounds of the main workspace
        //TODO: probably send a workspace update message
    }
}

class Connection {
    constructor(socket, workspace) {
        /*
         * XXX: Make the desired boundaries an argument passed into the
         *      constructor?
         */
        this.initializedLayout = false;
        this.socket = socket;
        this.workspace = workspace;
        this.viewSpace = new ServerViewSpace(this.workspace.boundaries);
        globals.VIEW_ID_STAMPER.stamp(this.viewSpace);
        
        if (globals.WDEBUG) {
            console.log(
                `User ${this.viewSpace.id}` +
                `connected to workspace ${this.workspace.id}`
            );
        }
        
        /*
         * XXX: This is a nifty way of making it easy to add and remove
         *      event strings to this list, but is it really that good of an
         *      idea? Is it readable?
         */
        // For each of the event strings listed here, there must be an
        // identically named function on the Connection prototype to attach
        // as a listener in the forEach loop.
        [   
            'consoleLog',
            'disconnect',
            'handleClick',
            'handleDrag',
            'handleScale',
            'reportView',
        ].forEach( e => this.socket.on(e, this[e].bind(this)) );

        this.socket.emit('init', {
            views: this.workspace.views,
            wsObjects: this.workspace.wsObjects,
            settings: this.workspace.settings,
            id: this.viewSpace.id
        });
    }

    /*
     * XXX: This might be a place where socket.io 'rooms' could
     *      come in handy. Look into it...
     */
    broadcast(event, data) {
        this.socket.emit(event, data);
        this.socket.broadcast.emit(event, data);
    }

    /*
     * XXX: What exactly does reportView do? The name is ambiguous, so once I
     *      figure this out I will definitely change it.
     */
    reportView(vsInfo) {
        if (this.workspace.views.length < this.workspace.clientLimit) {
            /*
             * XXX: Watch out for coersive equality vs. strict equality.
             *      Decide if coercion should be allowed for each instance.
             */
            if (this.viewSpace.id === vsInfo.id) {
                this.viewSpace.assign(vsInfo);
            }

            if (!this.initializedLayout) {
                this.initializedLayout = true;

                if (typeof this.workspace.layoutHandler === 'function') {
                    this.workspace.layoutHandler(
                        this.workspace, 
                        this.viewSpace
                    );
                } else {
                    console.log('Layout handler is not attached!');
                }

                this.workspace.views.push(this.viewSpace);
            }

            this.broadcast(globals.EVENT_UD_USER, this.viewSpace);
        } else if (!this.initializedLayout) {
            /* XXX: Hang on, look at that condition check in 'else if'
             *      statement above. Why are we only disconnecting if we
             *      haven't been initialized?
             */
            this.workspace.views.push(this.viewSpace);
            this.socket.send(globals.EVENT_DC_USER);

            /*
             * XXX: Hold on a second... Did we just push the viewSpace into
             *      the views... only to remove it again right away? Why 
             *      are we doing that?
             */
            const idx = this.workspace.views.findIndex( v => 
                v.id === this.viewSpace.id
            );
            if (idx >= 0) this.workspace.views.splice(idx,1);
        }
    }

    handleDrag(vs, x, y, dx, dy) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.dragHandler !== 'function') {
            console.log(`Drag handler is not attached for ${vs.id}`);
            return;
        }

        const dragCanvas = !this.workspace.wsObjects.some( o => {
            if (o.containsPoint(x,y)) {
                this.workspace.dragHandler(
                    o, this.viewSpace, 
                    x, y, dx, dy
                );
                this.broadcast(globals.EVENT_UD_OBJS, this.workspace.wsObjects);
                return true;
            }
            return false;
        });

        /*
         * XXX: This is causing jitter. Will have to look in the 
         *      debugger, perhaps multiple events are firing on drags.
         */
        if (dragCanvas) {
            this.workspace.dragHandler(
                this.viewSpace, this.viewSpace,
                x, y, dx, dy
            );
        }
        
        this.broadcast(globals.EVENT_UD_USER, this.viewSpace);
    }

    handleClick(x, y) {
        // Failsafe.
        if (typeof this.workspace.clickHandler !== 'function') {
            console.log('Click Handler is not attached!');
            return;
        }

        const clickCanvas = !this.workspace.wsObjects.some( o => {
            if (o.containsPoint(x,y)) {
                if (globals.WDEBUG) {
                    console.log('Clicked on', o);
                }
                this.workspace.clickHandler(o, this.viewSpace, x, y);
                return true;
            }
            return false;
        });

        if (clickCanvas) {
            this.workspace.clickHandler(this.workspace, this.viewSpace, x, y);
            if (globals.WDEBUG) {
                console.log('Clicked on the background.');
            }
        } 

        this.broadcast(globals.EVENT_UD_USER, this.viewSpace);
        this.broadcast(globals.EVENT_UD_OBJS, this.workspace.wsObjects);
    }

    handleScale(vs, newScale) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.scaleHandler !== 'function') {
            console.log('Scale handler is not attached!');
            return;
        }

        this.workspace.scaleHandler(this.viewSpace, newScale);
        this.broadcast(globals.EVENT_UD_USER, this.viewSpace);
    }

    consoleLog(toBeLogged) {
        if (globals.WDEBUG) console.log(toBeLogged);
    }

    disconnect() {
        const idx = this.workspace.views.findIndex( 
            v => v.id === this.viewSpace.id
        );

        if (idx >= 0) {
            console.log(
                `user ${this.viewSpace.id} ` +
                `disconnected from workspace ${this.workspace.id}`
            );

            this.workspace.views.splice(idx,1);
            this.broadcast(globals.EVENT_RM_USER, this.viewSpace.id);
        }
    }
}

class WSObject {
    constructor(x, y, width, height, type = 'view/background', opts) {
        /*
         * XXX: What is the object supposed to be if opts is not defined?
         */
        if (opts) {
            if (opts.imgsrc) {
                this.imgsrc = opts.imgsrc;
            } else {
                /*
                 * XXX: But what if opts.draw is also undefined??
                 */
                this.draw = opts.draw;
                this.drawStart = opts.drawStart || this.draw;
            }
        }
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    containsPoint(x,y) {
        return  (this.x < x) && 
                (this.x  + this.width > x) && 
                (this.y < y) && 
                (this.y  + this.height > y);
    }

    move(dx, dy) {
        this.x += dx;
        this.y += dy;
    }

    /*
     * XXX: If we really want to ensure a layer of abstraction, perhaps a setter
     *      might be more transparent to the user.
     */
    setType(type) {
        this.type = type;
    }

    moveToXY(x, y) {
        this.x = x;
        this.y = y;
    }

    setImgSrc(imagePath) {
        this.imgsrc = imagePath;
    }
}

class ServerViewSpace extends utils.ViewSpace {
    constructor(boundaries) {
        super();
        this.boundaries = boundaries;
        this.type = 'view/background';
    }

    canMoveToX(value) {
        return (value >= 0) &&
            (value + this.effectiveWidth <= this.boundaries.x);
    }

    canMoveToY(value) {
        return (value >= 0) &&
            (value + this.effectiveHeight <= this.boundaries.y);
    }

    move(dx, dy) {
        this.moveToXY(this.x + dx, this.y + dy);
    }

    moveToXY(newX, newY) {
        if (this.canMoveToX(newX)) this.x = newX;
        if (this.canMoveToY(newY)) this.y = newY;
    }

    /*
     * XXX: Divide by? Maybe I need to refresh my understanding of the word 
     *      'scale', because my intuition is to say that this the reverse of what 
     *      we actually want. I could very easily be wrong about this though. I'll 
     *      look it up.
     *
     *      Also at this point I really think we should have an 'isInRange' 
     *      function for checking boundaries.
     */
    rescale(newScale) {
        const newWidth = this.width / newScale;
        const newHeight = this.height / newScale;

        if (this.x + newWidth < this.boundaries.x && 
                this.y + newHeight < this.boundaries.y) {
            this.scale = newScale;
            this.effectiveWidth = newWidth;
            this.effectiveHeight = newHeight;
        } else {
            if (globals.WDEBUG) console.log('Scale out of Range!');
        }
    }

    top() {
        return this.y;
    }

    bottom() {
        return (this.y + this.effectiveHeight);
    }

    left() {
        return this.x;
    }

    right() {
        return (this.x + this.effectiveWidth);
    }

    center() {
        return {
            x : (this.x + (this.effectiveWidth / 2)),
            y : (this.y + (this.effectiveHeight / 2))
        };
    }
}

exports.WorkSpace = WorkSpace;
exports.WSObject = WSObject;

