/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Original author: Jesse Rolheiser
 * Revised by: Scott Bateman
 * Latest edition by: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

//TODO: Update canvas to work more like this for drawings: 
// https://simonsarris.com/making-html5-canvas-useful/
//TODO: Stretch goal is to incorporate a canvas library: 
// http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/
//TODO: Allow subcanvas to be drawn on top: 
// https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers

'use strict';

/*
 * XXX: General TODO list for myself, as part of code cleanup, bringing this
 *      code up to date:
 *
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
const utils = require('./shared.js');

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

const WorkSpace = (function defineWorkSpace() {
    const MIN_BOUNDARY = 100;
    const DEFAULTS = Object.freeze({
        DEBUG: false,
        COLOUR: '#aaaaaa',
        BOUNDARY: 10000,
        CLIENT_LIMIT: 10,
    });

    function determineSettings(requested = {}) {
        function boundary(x) {
            return x >= MIN_BOUNDARY ? x : DEFAULTS.BOUNDARY;
        }

        function getValidBoundaries(bounds = {}) {
            return {
                x: boundary(Number(bounds.x)),
                y: boundary(Number(bounds.y)),
            };
        }

        const settings = {};
        settings.debug = Boolean(requested.debug);
        settings.BGcolor = requested.BGcolor || DEFAULTS.COLOUR;
        settings.bounds = getValidBoundaries(requested.bounds);
        settings.clientLimit = requested.clientLimit || DEFAULTS.CLIENT_LIMIT;

        return settings;
    }

    function generateRequestHandler() {
        const app = express();

        // Establish routes.
        app.get('/', (req, res) => {
            res.sendFile(path.resolve('../src/view.html'));
        });
        app.get('/shared.js', (req, res) => {
            res.sendFile(path.resolve('../src/shared.js'));
        });
        app.get('/client.js', (req, res) => {
            res.sendFile(path.resolve('../src/client.js'));
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

    class WorkSpace {
        constructor(port, settings) {
            this.settings = determineSettings(settings);
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
        }

        get users() { return this.views; }
        get width() { return this.settings.bounds.x; }
        get height() { return this.settings.bounds.y; }

        set width(width) { this.settings.bounds.x = width; }
        set height(height) { this.settings.bounds.y = height; }

        addSubWS(subWS) {
            this.subWS.push(subWS);
            //TODO: add check to make sure subWS is in bounds of the main workspace
            //TODO: probably send a workspace update message
        }

        addWSObject(obj) {
            globals.OBJ_ID_STAMPER.stamp(obj);
            this.wsObjects.push(obj);
            if (globals.WDEBUG) { 
                console.log(`Adding object: ${obj.id} (${obj.type})`);
            }
        }

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
        attachClickHandler(func) {
            this.clickHandler = func;
        }

        attachDragHandler(func) {
            this.dragHandler = func;
        }

        attachLayoutHandler(func) {
            this.layoutHandler = func;
        }

        attachScaleHandler(func) {
            this.scaleHandler = func;
        }

        getCenter() {
            return {
                x: this.settings.bounds.x / 2,
                y: this.settings.bounds.y / 2
            };
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
    }

    return WorkSpace;
})();

class Connection {
    constructor(socket, workspace) {
        /*
         * XXX: Make the desired boundaries an argument passed into the
         *      constructor?
         */
        this.initializedLayout = false;
        this.socket = socket;
        this.workspace = workspace;
        this.viewSpace = new ServerViewSpace(this.workspace.settings.bounds);
        
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
            views: this.workspace.views.map( v => v.retrieve() ),
            wsObjects: this.workspace.wsObjects.map( o => o.retrieve() ),
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

    handleClick(x, y) {
        // Failsafe.
        if (typeof this.workspace.clickHandler !== 'function') {
            console.log('Click Handler is not attached!');
            return;
        }

        const obj = this.workspace.wsObjects.find( o => o.containsPoint(x,y) );
        if (obj) {
            if (globals.WDEBUG) {
                console.log('Clicked on', obj);
            }
            this.workspace.clickHandler(obj, this.viewSpace, x, y);
        } else {
            this.workspace.clickHandler(this.workspace, this.viewSpace, x, y);
            if (globals.WDEBUG) {
                console.log('Clicked on the background.');
            }
        }

        this.broadcast(
            globals.EVENT_UD_USER,
            this.viewSpace.retrieve()
        );
        this.broadcast(
            globals.EVENT_UD_OBJS,
            this.workspace.wsObjects.map( o => o.retrieve() )
        );
    }

    handleDrag(vs, x, y, dx, dy) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.dragHandler !== 'function') {
            console.log(`Drag handler is not attached for ${vs.id}`);
            return;
        }

        const obj = this.workspace.wsObjects.find( o => o.containsPoint(x,y) );
        if (obj) {
            this.workspace.dragHandler(
                obj, this.viewSpace, 
                x, y, dx, dy
            );
            this.broadcast(
                globals.EVENT_UD_OBJS,
                this.workspace.wsObjects.map( o => o.retrieve() )
            );
        } else {
            /*
             * XXX: This is causing jitter. Will have to look in the 
             *      debugger, perhaps multiple events are firing on drags.
             */
            this.workspace.dragHandler(
                this.viewSpace, this.viewSpace,
                x, y, dx, dy
            );
        }
        
        this.broadcast(
            globals.EVENT_UD_USER,
            this.viewSpace.retrieve()
        );
    }

    handleScale(vs, newScale) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.scaleHandler !== 'function') {
            console.log('Scale handler is not attached!');
            return;
        }

        this.workspace.scaleHandler(this.viewSpace, newScale);
        this.broadcast(
            globals.EVENT_UD_USER,
            this.viewSpace.retrieve()
        );
    }

    /*
     * XXX: What exactly does reportView do? The name is ambiguous, so once I
     *      figure this out I will definitely change it.
     */
    reportView(vsInfo) {
        if (this.workspace.views.length < this.workspace.settings.clientLimit) {
            /*
             * XXX: Watch out for coersive equality vs. strict equality.
             *      Decide if coercion should be allowed for each instance.
             */
            if (this.viewSpace.id === vsInfo.id) {
                this.viewSpace.assign(vsInfo);
            }

            if (!this.initializedLayout) {
                this.initializedLayout = true;
                this.workspace.views.push(this.viewSpace);

                if (typeof this.workspace.layoutHandler === 'function') {
                    this.workspace.layoutHandler(
                        this.workspace, 
                        this.viewSpace
                    );
                } else {
                    console.log('Layout handler is not attached!');
                }
            }

            this.broadcast(
                globals.EVENT_UD_USER,
                this.viewSpace.retrieve()
            );
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
}

class ServerWSObject extends utils.WSObject {
    constructor(x, y, width, height, type = 'view/background', opts) {
        super();
        const values = {x, y, width, height, type};

        /*
         * XXX: What is the object supposed to be if opts is not defined?
         */
        if (opts) {
            if (opts.imgsrc) {
                values.imgsrc = opts.imgsrc;
            } else {
                /*
                 * XXX: But what if opts.draw is also undefined??
                 */
                values.draw = opts.draw;
                values.drawStart = opts.drawStart || values.draw;
            }
        }

        this.assign(values);
    }

    containsPoint(x,y) {
        return  (this.x < x) && 
                (this.x + this.width > x) && 
                (this.y < y) && 
                (this.y + this.height > y);
    }

    move(dx, dy) {
        this.moveToXY(this.x + dx, this.y + dy);
    }

    moveToXY(x, y) {
        this.assign({x,y});
    }
}

class ServerViewSpace extends utils.ViewSpace {
    constructor(boundaries, type = 'view/background') {
        super();
        this.boundaries = boundaries;
        this.type = type;
        globals.VIEW_ID_STAMPER.stamp(this);
    }

    areValidDimensions(width, height) {
        return (this.x + width < this.boundaries.x) &&
            (this.y + height < this.boundaries.y);
    }

    bottom() {
        return (this.y + this.effectiveHeight);
    }

    canMoveToX(value) {
        return (value >= 0) &&
            (value + this.effectiveWidth <= this.boundaries.x);
    }

    canMoveToY(value) {
        return (value >= 0) &&
            (value + this.effectiveHeight <= this.boundaries.y);
    }

    center() {
        return {
            x : (this.x + (this.effectiveWidth / 2)),
            y : (this.y + (this.effectiveHeight / 2))
        };
    }

    left() {
        return this.x;
    }

    move(dx, dy) {
        this.moveToXY(this.x + dx, this.y + dy);
    }

    moveToXY(newX, newY) {
        const values = {
            x: this.x, 
            y: this.y
        };
        if (this.canMoveToX(newX)) values.x = newX;
        if (this.canMoveToY(newY)) values.y = newY;
        this.assign(values);
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
        if (this.areValidDimensions(newWidth, newHeight)) {
            this.assign({
                scale: newScale,
                effectiveWidth: newWidth,
                effectiveHeight: newHeight,
            });
        } 
    }

    right() {
        return (this.x + this.effectiveWidth);
    }

    top() {
        return this.y;
    }
}

exports.WorkSpace = WorkSpace;
exports.WSObject = ServerWSObject;

