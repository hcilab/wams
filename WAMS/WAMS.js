//TODO: Update canvas to work more like this for drawings: https://simonsarris.com/making-html5-canvas-useful/
//TODO: Stretch goal is to incorporate a canvas library: http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/
//TODO: Allow subcanvas to be drawn on top: https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers

/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Original author: Jesse Rolheiser
 * Revised by: Scott Bateman
 * Latest edition by: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/*
 * XXX: General TODO list for myself, as part of code cleanup, bringing this
 *      code up to date:
 *
 *      [ ] Set to use JavaScript's "strict" mode.
 *          - Do this last, otherwise there will be problems...
 *      [X] Eliminate all use of 'var', replace with 'const' or 'let'.
 *      [X] Organize globals, eliminate where possible.
 *      [ ] Write ID generator factory, use for all IDs.
 *      [ ] Switch to using functional style wherever possible, using ES6
 *           standard methods. This should make for more readable code, and
 *           probably faster code too, because the operations will already be
 *           optimized.
 *      [ ] Rename variables where appropriate.
 *      [X] Convert all prototype code into ES6 'class' style.
 *          - Better readability, extensibility.
 *      [X] Write a Connection class.
 *      [ ] Eliminate use of 'self' variables, use explicit binding.
 *      [ ] Look at all interior functions, would they benefit from being
 *           ES6 arrow functions?
 *      [X] Replace classic JS concatenated strings with ES6 backtick strings,
 *           where necessary. (Or everywhere for consistency?)
 *      [ ] Switch to using strict equality unless coercive equality is clearly
 *           beneficial in a given circumstance.
 *      [X] Replace all use of the custom Array.prototype.remove() function
 *           with the standard Array.prototype.splice().
 */

/*
 * XXX: Look into socket.io 'rooms', as they look like the kind of thing that
 *      might make some of this work a lot easier.
 */
const express = require('express');
const http = require('http');
const io = require('socket.io');
const path = require('path')

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
    const constants = {
        WDEBUG: true,
    };

    /* 
     * XXX: There are several instances where IDs are created by incrementing
     *      some value, often a global. I think these would probably be
     *      better supplied by generators, so I think I'll write a function
     *      in the utils file which creates ID generators to be used anywhere
     *      this is going on.
     */
    const variables = {
        WSOBID: 0,
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

    Object.entries(variables).forEach( ([p,v]) => {
        Object.defineProperty(rv, p, {
            get() { return variables[p]; },
            set(val) { variables[p] = val; },
            configurable: false,
            enumerable: true
        });
    });

    return Object.freeze(rv);
})();

class WorkSpace {
    constructor(port, settings) {
        this.clientLimit = 10;
        this.views = [];
        this.wsObjects = [];
        this.subWS = [];
        this.boundaries = {
            x : 10000,
            y : 10000
        };
        this.viewID = 1;
        this.settings = settings || this.defaultSettings();

        /*
         * XXX: Redefinition of this.id!! What is going on here? Which is the ID
         *      that we actually want, and where does port come from? Is it a
         *      global?
         *      - Answer: Just found it! It's passed in to the constructor as
         *          an argument, along with settings, seen below.
         *      - I'm going to assume that the port is the ID we need.
         *          + (But is it the ID we deserve?)
         */
        this.id = port;

        this.app = express();

        /* 
         * XXX: Register routes to the app for GET requests. Should this be lifted
         *      into a function for readability? It will probably be immediately
         *      obvious what's going on to anyone familiar with Express.js, but it
         *      still might be useful.
         */
        this.app.get('/', function(req, res) {
            res.sendFile(path.resolve('../WAMS/view.html'));
        });
        this.app.get('/WAMS-util.js', function(req, res) {
            res.sendFile(path.resolve('../WAMS/WAMS-util.js'));
        });
        this.app.get('/WAMS-view.js', function(req, res) {
            res.sendFile(path.resolve('../WAMS/WAMS-view.js'));
        });

        /* 
         * XXX: express.static() generates a middleware function for serving
         *      static assets from the directory specified.
         *      - The order in which these functions are registered with
         *          app.use() is important! The callbacks will be triggered
         *          in this order!
         *      - When app.use() is called without a 'path' argument, as it is
         *          here, it uses the default '/' argument, with the result
         *          that these callbacks will be executed for _every_ request
         *          to the app!
         *          + Should therefore consider specifying the path!!
         *      - Should also consider specifying options. Possibly useful:
         *          + immutable
         *          + maxAge
         */
        this.app.use(express.static(path.resolve('./Images')));
        this.app.use(express.static(path.resolve('../libs')));

        /*
         * XXX: Are we sure we want to create the server and listen right away?
         *      Don't we want to wait until the user has had the opportunity to
         *      complete a few more initialization tasks? We can expose a function
         *      which allows the user to control when these steps happen.
         *
         *      This is specifically because we have things set up right now such
         *      that the user is expected to attach handlers _after_ constructing
         *      a WorkSpace object. That is to say, _after_ the server has already
         *      started listening for connections according to the current setup.
         */
        this.http = http.createServer(this.app);

        this.http.listen(port, () => {
            /*
             * XXX: I'm not sure we need to suddenly import a library for this.
             *      Can't we just use this.http.address()?
             */
            //const ip = require('ip');
            //console.log(`listening on ${ip.address()}:${port}`);
            console.log('Listening on', this.http.address());
        });

        this.io = io.listen(this.http);
        this.io.on('connection', (socket) => {new Connection(socket, this);});
    }

    get users() { return this.views; }
    get width() { return this.boundaries.x; }
    get height() { return this.boundaries.y; }

    set width(w) { this.boundaries.x = w; }
    set height(h) { this.boundaries.y = h; }

    /*
     * XXX: Ahh okay, this is where the handlers get attached.
     *      Do we really need separate functions for attaching each one? Would 
     *      it be beneficial to define a single attachHandler function which 
     *      takes an argument describing which handler to attach?
     *      - Also, is there a way to not limit our API like this? What if 
     *          someone making use of it wants to implement other kinds of 
     *          interactions between the users?
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
        obj.id = globals.WSOBID++;
        this.wsObjects.push(obj);
        if (globals.WDEBUG) { 
            console.log(`Adding object: ${obj.id} (${obj.type})`);
        }
    }

    removeWSObject(obj) {
        for (let i = this.wsObjects.length - 1; i >= 0; i--) {
            if (this.wsObjects[i].id == obj.id) {
                this.wsObjects.splice(i,1);
                if (globals.WDEBUG) console.log(`removing object: ${obj.id} (${obj.type})`);
                break;
            }
        }
    }

    setBoundaries(maxX, maxY) {
        this.boundaries.x = maxX;
        this.boundaries.y = maxY;
    }

    getCenter() {
        return {
            x : this.boundaries.x/2,
            y : this.boundaries.y/2
        };
    }

    setClientLimit(maxUsers) {
        this.clientLimit = maxUsers;
    }

    defaultSettings() {
        return {
            debug : false,
            BGcolor : "#aaaaaa"
        };
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
        this.viewSpace = new ViewSpace(workspace.viewID++);
        this.viewSpace.boundaries = workspace.boundaries;
        this.workspace = workspace;
        
        if (globals.WDEBUG) {
            console.log(`User ${this.viewSpace.id} connected to workspace ${this.workspace.id}`);
        }
        
        this.socket.on('reportView', this.reportView.bind(this));
        this.socket.on('handleDrag', this.handleDrag.bind(this));
        this.socket.on('handleClick', this.handleClick.bind(this));
        this.socket.on('handleScale', this.handleScale.bind(this));
        this.socket.on('consoleLog', this.consoleLog.bind(this));
        this.socket.on('disconnect', this.disconnect.bind(this));

        this.socket.emit('init', {
            views : this.workspace.views,
            wsObjects : this.workspace.wsObjects,
            settings : this.workspace.settings,
            id : this.viewSpace.id
        });
    }

    reportView(vsInfo) {
        if (this.workspace.views.length < this.workspace.clientLimit) {
            /*
             * XXX: Watch out for coersive equality vs. strict equality.
             *      Decide if coercion should be allowed for each instance.
             */
            if (this.viewSpace.id == vsInfo.id) {
                this.viewSpace.x = vsInfo.x;
                this.viewSpace.y = vsInfo.y;
                this.viewSpace.w = vsInfo.w;
                this.viewSpace.h = vsInfo.h;
                this.viewSpace.ew = vsInfo.ew;
                this.viewSpace.eh = vsInfo.eh;
                this.viewSpace.scale = vsInfo.scale;
                this.viewSpace.id = vsInfo.id;
                this.viewSpace.views = [];
            }
            if (!this.initializedLayout) {
                this.initializedLayout = true;

                /*
                 * XXX: Why is this check necessary? And why is the 
                 *      viewSpace pushed into the views regardless?
                 */
                if (this.workspace.layoutHandler != null) {
                    this.workspace.layoutHandler(this.workspace, this.viewSpace);
                } else {
                    console.log("Layout handler is not attached!");
                }
                this.workspace.views.push(this.viewSpace);
            }

            /*
             * XXX: This might be a place where socket.io 'rooms' could
             *      come in handy. Look into it...
             */
            this.socket.emit('updateUser', this.viewSpace);
            this.socket.broadcast.emit('updateUser', this.viewSpace);
        } else if (!this.initializedLayout) {
            this.workspace.views.push(this.viewSpace);
            this.socket.send("user_disconnect");

            /*
             * XXX: Hold on a second... Did we just push the viewSpace into
             *      the views... only to remove it again right away? Why 
             *      are we doing that?
             *
             *      Also if we do want to keep doing this, might be wise to
             *      use built-in Array.prototype functions to achieve this,
             *      such as indexOf() and splice().
             */
            for (let i = 0; i < views.length; i++) {
                if (this.workspace.views[i].id == this.viewSpace.id) {
                    this.workspace.views.splice(i,1);
                    break;
                }
            }
        }
    }

    handleDrag(vs, x, y, dx, dy) {
        if (vs.id == this.viewSpace.id) {
            /*
             * XXX: Why do we need this check? What is the dragHandler?
             */
            if (this.workspace.dragHandler != null) {
                for (let i = this.workspace.wsObjects.length - 1; i >= 0; i--) {
                    /*
                     * XXX: What's going on in this condition check? Maybe 
                     *      it should be lifted out into a function that 
                     *      returns a boolean.
                     */
                    if ((this.workspace.wsObjects[i].x < x) && 
                            (this.workspace.wsObjects[i].x  + this.workspace.wsObjects[i].w > x) && 
                            (this.workspace.wsObjects[i].y < y) && 
                            (this.workspace.wsObjects[i].y  + this.workspace.wsObjects[i].h > y)) {
                        this.workspace.dragHandler(this.workspace.wsObjects[i], this.viewSpace, x, y, dx, dy);
                        this.socket.emit('updateUser', this.viewSpace);
                        this.socket.broadcast.emit('updateUser', this.viewSpace);
                        this.socket.emit('updateObjects', this.workspace.wsObjects);
                        this.socket.broadcast.emit('updateObjects', this.workspace.wsObjects);
                        break;
                    } else if (i == 0) {
                        this.workspace.dragHandler(this.viewSpace, this.viewSpace, x, y, dx, dy);
                        this.socket.emit('updateUser', this.viewSpace);
                        this.socket.broadcast.emit('updateUser', this.viewSpace);
                    }  
                }
            } else {
                console.log(`Drag handler is not attached for ${vs.id}`);
            }
        }
    }

    handleClick(x, y) {
        /*
         * XXX: Where are these handler's getting attached that they need
         *      to be checked for existence? Are they defined by someone
         *      making use of the WAMS API?
         */
        if (this.workspace.clickHandler != null) {
            if (globals.WDEBUG) console.log(this.workspace.wsObjects.length);
            let foundObject = false;

            /*
             * XXX: Switch to using Array.prototype.forEach().
             *      - Check that, looks like there's a "break" statement,
             *          perhaps Array.prototype.some() would be better.
             */
            for (let i = this.workspace.wsObjects.length - 1; i >= 0; i--) {
                if (globals.WDEBUG) console.log("clicked: "+this.workspace.wsObjects[i]);

                /*
                 * XXX: Second time seeing a condition check essentially
                 *      identical to this. Should probably be lifted out
                 *      into a boolean function.
                 */
                if ((this.workspace.wsObjects[i].x < x) && 
                        (this.workspace.wsObjects[i].x  + this.workspace.wsObjects[i].w > x) && 
                        (this.workspace.wsObjects[i].y < y) && 
                        (this.workspace.wsObjects[i].y  + this.workspace.wsObjects[i].h > y)) {
                    this.workspace.clickHandler(this.workspace.wsObjects[i],this.viewSpace, x, y);
                    this.socket.emit('updateUser', this.viewSpace);
                    this.socket.broadcast.emit('updateUser', this.viewSpace);
                    this.socket.emit('updateObjects', this.workspace.wsObjects);
                    this.socket.broadcast.emit('updateObjects', this.workspace.wsObjects);
                    foundObject = true;
                    break;
                }
            }

            /*
             * XXX: Hang on... Are we sending update events regardless of
             *      whether we find the object or not? I'm not 100% sure
             *      right now, but I'll take a closer look at the code and
             *      try to figure out what's going on here.
             */
            if (!foundObject) {
                this.workspace.clickHandler(this.workspace, this.viewSpace, x, y);
                this.socket.emit('updateUser', this.viewSpace);
                this.socket.broadcast.emit('updateUser', this.viewSpace);
                this.socket.emit('updateObjects', this.workspace.wsObjects);
                this.socket.broadcast.emit('updateObjects', this.workspace.wsObjects);
                if (globals.WDEBUG) console.log("not found");
            } else if (globals.WDEBUG) {
                console.log("found");
            }
        } else {
            console.log("Click Handler is not attached!");
        }
    }

    handleScale(vs, newScale) {
        if (vs.id == this.viewSpace.id) {
            if (this.workspace.scaleHandler != null) {
                this.workspace.scaleHandler(this.viewSpace, newScale);

                /*
                 * XXX: I'm not liking seeing these 'updateUser' strings 
                 *      all over the place. Place the string in a global 
                 *      constant.
                 */
                this.socket.emit('updateUser', this.viewSpace);
                this.socket.broadcast.emit('updateUser', this.viewSpace);
            } else {
                console.log("Scale handler is not attached!");
            }
        }
    }

    consoleLog(toBeLogged) {
        if (globals.WDEBUG) console.log(toBeLogged);
    }

    disconnect() {
        console.log(`user ${this.viewSpace.id} disconnected from workspace ${this.workspace.id}`);
        this.socket.broadcast.emit('removeUser', this.viewSpace.id);
        /*
         * XXX: Use ES6 standard Array.prototype functions instead.
         */
        for (let i = 0; i < this.workspace.views.length; i++) {
            if (this.workspace.views[i].id == this.viewSpace.id) {
                this.workspace.views.splice(i,1);
                break;
            }
        }
    }
}

class WSObject {
    constructor(x, y, w, h, type, opts) {
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
        this.w = w;
        this.h = h;
        this.type = type || "view/background";
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

class ViewSpace {
    constructor(id) {
        /*
         * XXX: What's the difference between this.w and this.ew? (Same for h and 
         *      eh). The answer is somewhere in here, but I think it would help if 
         *      the variables had more intuitive names.
         *      
         *      + Answer: It appears that:
         *                  - w and h refer to the 'base' width and height. 
         *                  - ew and eh refer to a 'scaled' width and height.
         *                      + Maybe the 'e' stands for 'effective'?
         */
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.ew = 0;
        this.eh = 0;
        this.scale = 1;
        this.rotation = 0;
        this.id = id;
        this.type = "view/background";
    }

    move(dx, dy) {
        /*
         * XXX: Where does this.boundaries get defined? It should maybe be in the
         *      constructor if we're going to depend on it like this.
         *
         *      Also, maybe save this.x + dx and this.y + dy in a variable instead
         *      of recalculating it multiple times.
         */
        if (this.x + dx >= 0 && (this.x + dx + this.ew) <= this.boundaries.x) {
            this.x += dx;
        }
        if (this.y + dy >= 0 && (this.y + dy + this.eh) <= this.boundaries.y) {
            this.y += dy;
        }
    }

    /*
     * XXX: Why are there no boundary checks in this function? There are boundary 
     *      checks in the above move() function, so there should probably be checks
     *      here too.
     */
    moveToXY(newX, newY) {
        if (newX >= 0 && newY >= 0) {
            this.x = newX;
            this.y = newY;
        }
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
        if (this.x + this.w/newScale < this.boundaries.x && this.y + this.h/newScale < this.boundaries.y) {
            this.scale = newScale;
            this.ew = this.w/this.scale;
            this.eh = this.h/this.scale; 
        } else {
            if (globals.WDEBUG) console.log("Scale out of Range!");
        }
    }

    top() {
        return this.y;
    }

    bottom() {
        return (this.y + this.eh);
    }

    left() {
        return this.x;
    }

    right() {
        return (this.x + this.ew);
    }

    center() {
        return {
            x : (this.x + (this.ew/2)),
            y : (this.y + (this.eh/2))
        };
    }
}

exports.WorkSpace = WorkSpace;
exports.WSObject = WSObject;

