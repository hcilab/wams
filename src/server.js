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
const WamsShared = require('./shared.js');

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
    const constants = {
        EVENT_DC_USER: 'wams-disconnect',
        EVENT_INIT:    'wams-initialize',
        EVENT_RM_USER: 'wams-remove-user',
        EVENT_UD_OBJS: 'wams-update-objects',
        EVENT_UD_USER: 'wams-update-user',
        WDEBUG: true,
        OBJ_ID_STAMPER: new WamsShared.IDStamper(),
        VIEW_ID_STAMPER: new WamsShared.IDStamper(),
        WS_ID_STAMPER: new WamsShared.IDStamper(),
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
    const PORT = 9000;
    const DEFAULTS = Object.freeze({
        debug: false,
        color: '#aaaaaa',
        bounds: {
            x: 10000,
            y: 10000,
        },
        clientLimit: 10,
    });

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

    function getLocalIP() {
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
        constructor(port = PORT, settings) {
            this.settings = WamsShared.initialize(DEFAULTS, settings);
            globals.WS_ID_STAMPER.stamp(this, port);

            // Things to track.
            this.views = [];
            this.wsObjects = [];
            this.subWS = [];

            // Will be used for establishing a server on which to listen.
            this.http = null;
            this.io = null;
            this.port = this.id;
            WamsShared.makeOwnPropertyImmutable(this, 'port');
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

        addView(view) {
            this.views.push(view);
        }

        addWSObject(obj) {
            globals.OBJ_ID_STAMPER.stamp(obj);
            this.wsObjects.push(obj);
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

        findObjectByCoordinates(x,y) {
            return this.wsObjects.find( o => o.containsPoint(x,y) );
        }

        getCenter() {
            return {
                x: this.settings.bounds.x / 2,
                y: this.settings.bounds.y / 2
            };
        }

        listen() {
            this.http = http.createServer(generateRequestHandler());
            this.http.listen(this.id, getLocalIP(), () => {
                console.log('Listening on', this.http.address());
            });
            this.io = io.listen(this.http);
            this.io.on('connection', (socket) => {new Connection(socket, this);});
        }

        removeView(view) {
            const idx = this.views.findIndex( v => v.id === view.id );
            if (idx >= 0) {
                this.views.splice(idx,1);
                return true;
            }
            return false;
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

        reportViews() {
            return this.views.map( v => v.report() );
        }

        reportWSObjects() {
            return this.wsObjects.map( o => o.report() );
        }
    }

    return WorkSpace;
})();

class Connection {
    constructor(socket, workspace) {
        /*
         * XXX: Make the desired bounds an argument passed into the
         *      constructor?
         */
        this.initializedLayout = false;
        this.socket = socket;
        this.workspace = workspace;
        this.viewSpace = new ServerViewSpace(this.workspace.settings.bounds);
        
        console.log(
            `User ${this.viewSpace.id} ` +
            `connected to workspace ${this.workspace.id}`
        );
    
        /*
         * XXX: This is a nifty way of making it easy to add and remove
         *      event strings to this list, but is it really that good of an
         *      idea? Is it readable?
         */
        // For each of the event strings listed here, there must be an
        // identically named function on the Connection prototype to attach
        // as a listener in the forEach loop.
        [   
            'disconnect',
            'handleClick',
            'handleDrag',
            'handleScale',
            'reportView',
        ].forEach( e => this.socket.on(e, this[e].bind(this)) );

        this.socket.emit(globals.EVENT_INIT, {
            views: this.workspace.reportViews(),
            wsObjects: this.workspace.reportWSObjects(),
            settings: this.workspace.settings,
            id: this.viewSpace.id,
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

    broadcastUserReport() {
        this.broadcast(
            globals.EVENT_UD_USER,
            this.viewSpace.report()
        );
    }

    broadcastObjectReport() {
        this.broadcast(
            globals.EVENT_UD_OBJS,
            this.workspace.reportWSObjects();
        );
    }

    disconnect() {
        if (this.workspace.removeView(this.viewSpace.id)) {
            console.log(
                `user ${this.viewSpace.id} ` +
                `disconnected from workspace ${this.workspace.id}`
            );
            this.broadcast(globals.EVENT_RM_USER, this.viewSpace.id);
        } else {
            throw 'Failed to disconnect.'
        }
    }

    handleClick(x, y) {
        // Failsafe.
        if (typeof this.workspace.clickHandler !== 'function') {
            console.log('Click Handler is not attached!');
            return;
        }

        const obj = this.workspace.findObjectByCoordinates(x,y);
        if (obj) {
            this.workspace.clickHandler(obj, this.viewSpace, x, y);
        } else {
            this.workspace.clickHandler(this.workspace, this.viewSpace, x, y);
        }

        this.broadcastUserReport();
        this.broadcastObjectReport();
    }

    handleDrag(vs, x, y, dx, dy) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.dragHandler !== 'function') {
            console.log(`Drag handler is not attached for ${vs.id}`);
            return;
        }

        const obj = this.workspace.findObjectByCoordinates(x,y);
        if (obj) {
            this.workspace.dragHandler(
                obj, this.viewSpace, 
                x, y, dx, dy
            );
            this.broadcastObjectReport()
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
        
        this.broadcastUserReport();
    }

    handleScale(vs, newScale) {
        // Failsafe checks.
        if (vs.id !== this.viewSpace.id) return;
        if (typeof this.workspace.scaleHandler !== 'function') {
            console.log('Scale handler is not attached!');
            return;
        }

        this.workspace.scaleHandler(this.viewSpace, newScale);
        this.broadcastUserReport()
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
                this.workspace.addView(this.viewSpace);

                if (typeof this.workspace.layoutHandler === 'function') {
                    this.workspace.layoutHandler(
                        this.workspace, 
                        this.viewSpace
                    );
                } else {
                    console.log('Layout handler is not attached!');
                }
            }

            this.broadcastUserReport()
        } else {
            /* XXX: Hang on, look at that condition check in 'else if'
             *      statement above. Why are we only disconnecting if we
             *      haven't been initialized?
             */
            this.socket.send(globals.EVENT_DC_USER);
        }
    }
}

class ServerWSObject extends WamsShared.WSObject {
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

class ServerViewSpace extends WamsShared.ViewSpace {
    constructor(bounds, type = 'view/background') {
        super();
        this.bounds = bounds;
        this.type = type;
        globals.VIEW_ID_STAMPER.stamp(this);
    }

    areValidDimensions(width, height) {
        return (this.x + width < this.bounds.x) &&
            (this.y + height < this.bounds.y);
    }

    bottom() {
        return (this.y + this.effectiveHeight);
    }

    canMoveToX(value) {
        return (value >= 0) &&
            (value + this.effectiveWidth <= this.bounds.x);
    }

    canMoveToY(value) {
        return (value >= 0) &&
            (value + this.effectiveHeight <= this.bounds.y);
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
     *      function for checking bounds.
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

/*
 * For testing:
 */
exports.Connection = Connection;
exports.ServerWSObject = ServerWSObject;
exports.ServerViewSpace = ServerViewSpace;

