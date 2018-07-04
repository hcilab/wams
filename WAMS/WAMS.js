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
 * XXX: Set all files to use JavaScript's "strict" mode.
 */

/*
 * XXX: Look into socket.io 'rooms', as they look like the kind of thing that
 *      might make some of this work a lot easier.
 */

/*
 * XXX: Eliminate all use of 'var'.
 *      Most uses can be converted to 'const' for explicit immutability.
 *      Other cases can use 'let' for more standard block scoping.
 */
var express = require('express');
var http = require('http');
var io = require('socket.io');
var path = require('path')

/*
 * XXX: I'm getting confused about what's global and what isn't while reading
 *      this code. I think I will switch to using a frozen 'globals' object
 *      with all global variables defined as properties on it, to make global
 *      references explicit. I've been toying with this design pattern in my
 *      other JavaScript code and I think I quite like it.
 */

/* 
 * XXX: There are several instances where IDs are created by incrementing
 *      some value, often a global. I think these would probably be
 *      better supplied by generators, so I think I'll write a function
 *      in the utils file which creates ID generators to be used anywhere
 *      this is going on.
 */
//globals for keeping track of IDs
var WSID = 0;   //workspace ID
var WSOBID = 0; //workspace Object ID
var CLIENTID = 1;

//set to false to limit console logging
var WDEBUG = true;

function WorkSpace(port, settings){
    this.app = express();

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
    this.io = io.listen(this.http);

    this.id = WSID++;
    this.viewID = 1;

    /* 
     * XXX: Register routes to the app for GET requests. Should this be lifted
     *      into a function for readability? It will probably be immediately
     *      obvious what's going on to anyone familiar with Express.js, but it
     *      still might be useful.
     */
    this.app.get('/', function(req, res){
        res.sendFile(path.resolve('../WAMS/view.html'));
    });
    this.app.get('/WAMS-util.js', function(req, res){
        res.sendFile(path.resolve('../WAMS/WAMS-util.js'));
    });
    this.app.get('/WAMS-view.js', function(req, res){
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
     * XXX: Data declarations are mixed with startup routines, which I
     *      don't think is ideal. I'll reorganize the code so that it's
     *      more clear, more quickly what properties exist on the object.
     */
    this.views = [];
    this.wsObjects = [];
    this.subWS = [];
    
    this.boundaries = {
        x : 10000,
        y : 10000
    };

    this.MAX_USERS = 10;

    /*
     * XXX: Redefinition of this.id!! What is going on here? Which is the ID
     *      that we actually want, and where does port come from? Is it a
     *      global?
     *      - Answer: Just found it! It's passed in to the constructor as
     *          an argument, along with settings, seen below.
     */
    this.id = port;

    this.settings = settings || this.defaultSettings();

    /*
     * XXX: This is a little nasty, so I'm going to look at refactoring
     *      it. First thing to do is to use an explicit 'this' binding
     *      instead of a lexical 'self' reference.
     *      - Most likely, I'll lift this code out into a Connection class.
     */
    var self = this;
    this.io.on('connection', function(socket){
        
        /*
         * XXX: Make the desired boundaries an argument passed into the
         *      constructor?
         */
        var viewSpace = new ViewSpace(self.viewID++);
        viewSpace.boundaries = self.boundaries;
        
        /*
         * XXX: Use ES6 backticks instead, much cleaner and I think it's
         *      more efficient too...
         */
        if (WDEBUG) console.log('User ' + viewSpace.id + ' connected to workspace ' + self.id);
        var initData = {
            views : self.views,
            wsObjects : self.wsObjects,
            settings : self.settings,
            id : viewSpace.id
        };

        socket.emit('init', initData);
        
        var initializedLayout = false;
        
        socket.on('reportView', function(vsInfo){
            if(self.views.length < self.MAX_USERS){
                /*
                 * XXX: Watch out for coersive equality vs. strict equality.
                 *      Decide if coercion should be allowed for each instance.
                 */
                if(viewSpace.id == vsInfo.id){
                    viewSpace.x = vsInfo.x;
                    viewSpace.y = vsInfo.y;
                    viewSpace.w = vsInfo.w;
                    viewSpace.h = vsInfo.h;
                    viewSpace.ew = vsInfo.ew;
                    viewSpace.eh = vsInfo.eh;
                    viewSpace.scale = vsInfo.scale;
                    viewSpace.id = vsInfo.id;
                    viewSpace.views = [];
                }
                if(!initializedLayout){
                    initializedLayout = true;

                    /*
                     * XXX: Why is this check necessary? And why is the 
                     *      viewSpace pushed into the views regardless?
                     */
                    if(self.layoutHandler != null){
                        self.layoutHandler(self, viewSpace);
                    }
                    else{
                        console.log("Layout handler is not attached!");
                    }
                    self.views.push(viewSpace);
                }

                /*
                 * XXX: This might be a place where socket.io 'rooms' could
                 *      come in handy. Look into it...
                 */
                socket.emit('updateUser', viewSpace);
                socket.broadcast.emit('updateUser', viewSpace);
            }
            else if(!initializedLayout){
                self.views.push(viewSpace);
                socket.send("user_disconnect");

                /*
                 * XXX: Hold on a second... Did we just push the viewSpace into
                 *      the views... only to remove it again right away? Why 
                 *      are we doing that?
                 *
                 *      Also if we do want to keep doing this, might be wise to
                 *      use built-in Array.prototype functions to achieve this,
                 *      such as indexOf() and splice().
                 */
                for (var i = 0; i < views.length; i++) {
                    if(self.views[i].id == viewSpace.id){
                        self.views.remove(i);
                        break;
                    }
                }
            }
        });

        socket.on('handleDrag', function(vs, x, y, dx, dy){
            if(vs.id == viewSpace.id){
                /*
                 * XXX: Why do we need this check? What is the dragHandler?
                 */
                if(self.dragHandler != null){
                    for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                        /*
                         * XXX: What's going on in this condition check? Maybe 
                         *      it should be lifted out into a function that 
                         *      returns a boolean.
                         */
                        if((self.wsObjects[i].x < x) && 
                                (self.wsObjects[i].x  + self.wsObjects[i].w > x) && 
                                (self.wsObjects[i].y < y) && 
                                (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                            self.dragHandler(self.wsObjects[i], viewSpace, x, y, dx, dy);
                            socket.emit('updateUser', viewSpace);
                            socket.broadcast.emit('updateUser', viewSpace);
                            socket.emit('updateObjects', self.wsObjects);
                            socket.broadcast.emit('updateObjects', self.wsObjects);
                            break;
                        }
                        else if(i == 0){
                            self.dragHandler(viewSpace, viewSpace, x, y, dx, dy);
                            socket.emit('updateUser', viewSpace);
                            socket.broadcast.emit('updateUser', viewSpace);
                        }  
                    }
                }
                else{
                    console.log("Drag handler is not attached for "+vs.id);
                }
            }
        });

        socket.on('handleClick', function(x, y){
            /*
             * XXX: Where are these handler's getting attached that they need
             *      to be checked for existence? Are they defined by someone
             *      making use of the WAMS API?
             */
            if(self.clickHandler != null){
                if (WDEBUG) console.log(self.wsObjects.length);
                foundObject = false;

                /*
                 * XXX: Switch to using Array.prototype.forEach().
                 *      - Check that, looks like there's a "break" statement,
                 *          perhaps Array.prototype.some() would be better.
                 */
                for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                    if (WDEBUG) console.log("clicked: "+self.wsObjects[i]);

                    /*
                     * XXX: Second time seeing a condition check essentially
                     *      identical to this. Should probably be lifted out
                     *      into a boolean function.
                     */
                    if((self.wsObjects[i].x < x) && 
                            (self.wsObjects[i].x  + self.wsObjects[i].w > x) && 
                            (self.wsObjects[i].y < y) && 
                            (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                        self.clickHandler(self.wsObjects[i],viewSpace, x, y);
                        socket.emit('updateUser', viewSpace);
                        socket.broadcast.emit('updateUser', viewSpace);
                        socket.emit('updateObjects', self.wsObjects);
                        socket.broadcast.emit('updateObjects', self.wsObjects);
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
                if(!foundObject){
                    self.clickHandler(self, viewSpace, x, y);
                    socket.emit('updateUser', viewSpace);
                    socket.broadcast.emit('updateUser', viewSpace);
                    socket.emit('updateObjects', self.wsObjects);
                    socket.broadcast.emit('updateObjects', self.wsObjects);
                    if (WDEBUG) console.log("not found");
                }
                else if (WDEBUG) console.log("found");
            }
            else{
                console.log("Click Handler is not attached!");
            }
        });

        socket.on('handleScale', function(vs, newScale){
            if(vs.id == viewSpace.id){
                if(self.scaleHandler != null){
                    self.scaleHandler(viewSpace, newScale);

                    /*
                     * XXX: I'm not liking seeing these 'updateUser' strings 
                     *      all over the place. Place the string in a global 
                     *      constant.
                     */
                    socket.emit('updateUser', viewSpace);
                    socket.broadcast.emit('updateUser', viewSpace);
                }
                else{
                    console.log("Scale handler is not attached!");
                }
            }
        });

        socket.on('consoleLog', function(toBeLogged){
            if (WDEBUG) console.log(toBeLogged);
        });

        socket.on('disconnect', function(){
            console.log('user ' + viewSpace.id + ' disconnected from workspace ' + self.id);
            socket.broadcast.emit('removeUser', viewSpace.id);
            /*
             * XXX: Use ES6 standard Array.prototype functions instead.
             */
            for (var i = 0; i < self.views.length; i++) {
                if(self.views[i].id == viewSpace.id){
                    self.views.remove(i);
                    break;
                }
            }
        });
    });

    this.http.listen(port, function(){
        /*
         * XXX: I'm not sure we need to suddenly import a library for this.
         *      Can't we just use this.http.address()?
         */
        var ip = require('ip');
        console.log('listening on ' + ip.address() + ':' + port);
    });
}

/*
 * XXX: Oh no, classic prototype syntax!! Clean up into ES6 'class' syntax and 
 *      define getters and setters where appropriate.
 */

/*
 * XXX: Ahh okay, this is where the handlers get attached.
 *      Do we really need separate functions for attaching each one? Would it
 *      be beneficial to define a single attachHandler function which takes
 *      an argument describing which handler to attach?
 *      - Also, is there a way to not limit our API like this? What if someone
 *          making use of it wants to implement other kinds of interactions
 *          between the users?
 */
WorkSpace.prototype.attachDragHandler = function(func){
    this.dragHandler = func;
}

WorkSpace.prototype.attachLayoutHandler = function(func){
    this.layoutHandler = func;
}

WorkSpace.prototype.attachClickHandler = function(func){
    this.clickHandler = func;
}

WorkSpace.prototype.attachScaleHandler = function(func){
    this.scaleHandler = func;
}


WorkSpace.prototype.addWSObject = function(obj){
    obj.id = WSOBID++;
    this.wsObjects.push(obj);
    if (WDEBUG) console.log("adding object: "+obj.id+" ("+obj.type+")");
}

WorkSpace.prototype.removeWSObject = function(obj){
    for (var i = this.wsObjects.length - 1; i >= 0; i--) {
        if(this.wsObjects[i].id == obj.id){
            this.wsObjects.remove(i);
            if (WDEBUG) console.log("removing object: "+obj.id+" ("+obj.type+")");
            break;
        }
    }
}

WorkSpace.prototype.getUsers = function(){
    return this.views;
}

WorkSpace.prototype.setBoundaries = function(maxX, maxY){
    this.boundaries.x = maxX;
    this.boundaries.y = maxY;
}

WorkSpace.prototype.getWidth = function(){
    return this.boundaries.x;
}

WorkSpace.prototype.getHeight = function(){
    return this.boundaries.y;
}

WorkSpace.prototype.getCenter = function(){
    return {
        x : this.boundaries.x/2,
        y : this.boundaries.y/2
    };
}

WorkSpace.prototype.setClientLimit = function(maxUsers){
    this.MAX_USERS = maxUsers;
}

WorkSpace.prototype.defaultSettings = function(){
    var defaults = {
        debug : false,
        BGcolor : "#aaaaaa"
    };
    return defaults;
}

WorkSpace.prototype.addSubWS = function(subWS) {
    this.subWS.push(subWS);
    //TODO: add check to make sure subWS is in bounds of the main workspace
    //TODO: probably send a workspace update message
}

function WSObject(x, y, w, h, type, opts){
    if (opts)
    {
        if (opts.imgsrc)
        {
            this.imgsrc = opts.imgsrc;
        }

        else
        {
            /*
             * XXX: But what if opts.draw is also undefined??
             */
            this.draw = opts.draw;

            if (opts.drawStart)
                this.drawStart = opts.drawStart;
            else
                this.drawStart = this.draw;
        }
    }
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type || "view/background";
}

WSObject.prototype.move = function(dx, dy){
    this.x += dx;
    this.y += dy;
}

/*
 * XXX: If we really want to ensure a layer of abstraction, perhaps a setter
 *      might be more transparent to the user.
 */
WSObject.prototype.setType = function(type){
    this.type = type;
}

WSObject.prototype.moveToXY = function(x, y){
    this.x = x;
    this.y = y;
}

WSObject.prototype.setImgSrc = function(imagePath){
    this.imgsrc = imagePath;
}

function ViewSpace(id){
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

ViewSpace.prototype.move = function(dx, dy){
    /*
     * XXX: Where does this.boundaries get defined? It should maybe be in the
     *      constructor if we're going to depend on it like this.
     *
     *      Also, maybe save this.x + dx and this.y + dy in a variable instead
     *      of recalculating it multiple times.
     */
    if(this.x + dx >= 0 && (this.x + dx + this.ew) <= this.boundaries.x){
        this.x += dx;
    }
    if(this.y + dy >= 0 && (this.y + dy + this.eh) <= this.boundaries.y){
        this.y += dy;
    }
}

/*
 * XXX: Why are there no boundary checks in this function? There are boundary 
 *      checks in the above move() function, so there should probably be checks
 *      here too.
 */
ViewSpace.prototype.moveToXY = function(newX, newY){
    if(newX >= 0 && newY >= 0){
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
ViewSpace.prototype.rescale = function(newScale){
    if(this.x + this.w/newScale < this.boundaries.x && this.y + this.h/newScale < this.boundaries.y){
        this.scale = newScale;
        this.ew = this.w/this.scale;
        this.eh = this.h/this.scale; 
    }
    else{
        if (WDEBUG) console.log("Scale out of Range!");
    }
}

ViewSpace.prototype.top = function(){
    return this.y;
}

ViewSpace.prototype.bottom = function(){
    return (this.y + this.eh);
}

ViewSpace.prototype.left = function(){
    return this.x;
}

ViewSpace.prototype.right = function(){
    return (this.x + this.ew);
}

ViewSpace.prototype.center = function(){
    /*
     * XXX: Why not just return it directly?
     */
    var returnValue = {
        x : (this.x + (this.ew/2)),
        y : (this.y + (this.eh/2))
    };
    return returnValue;
}

/*
 * XXX: Isn't this exactly the same as what's in the WAMS-util.js file?
 */
// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
}

exports.WorkSpace = WorkSpace;
exports.WSObject = WSObject;

