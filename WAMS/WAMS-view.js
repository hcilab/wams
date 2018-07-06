/*
 * WAMS code to be executed in the client browser.
 */

/*
 * XXX: General TODO list for myself, as part of code cleanup, bringing this
 *      code up to date:
 *
 *      [ ] Set to use JavaScript's "strict" mode.
 *          - Do this last, otherwise there will be problems...
 *      [X] Eliminate all use of 'var', replace with 'const' or 'let'.
 *      [ ] Organize globals, eliminate where possible.
 *      [ ] Write ID generator factory, use for all IDs.
 *      [ ] Switch to using functional style wherever possible, using ES6
 *           standard methods. This should make for more readable code, and
 *           probably faster code too, because the operations will already be
 *           optimized.
 *      [ ] Rename variables where appropriate.
 *      [ ] Convert all prototype code into ES6 'class' style.
 *          - Better readability, extensibility.
 *      [ ] Eliminate use of 'self' variables, use explicit binding.
 *      [ ] Look at all interior functions, would they benefit from being
 *           ES6 arrow functions?
 *      [ ] Replace classic JS concatenated strings with ES6 backtick strings,
 *           where necessary. (Or everywhere for consistency?)
 *      [ ] Switch to using strict equality unless coercive equality is clearly
 *           beneficial in a given circumstance.
 *      [ ] Replace all use of the custom Array.prototype.remove() function
 *           with the standard Array.prototype.splice().
 */

window.addEventListener('load', onWindowLoad, false);

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
    const hammerOptions = {
        dragLockToAxis : true,
        dragBlockHorizontal : true,
        preventDefault : true,
        transform_always_block: true,
        transform_min_scale: 1,
        drag_block_horizontal: true,
        drag_block_vertical: true,
        drag_min_distance: 0
    };

    const canvas = document.querySelector('#main');
    const constants = {
        CANVAS_CONTEXT: canvas.getContext('2d'),
        EVENT_DC_USER: 'user_disconnect',
        EVENT_RM_USER: 'removeUser',
        EVENT_UD_OBJS: 'updateObjects',
        EVENT_UD_USER: 'updateUser',
        FRAMERATE: 1000 / 60,
        IMAGES: [],
        LAST_MOUSE: {x: 0, y: 0},
        MAIN_VIEWSPACE: new ViewSpace(
            0,
            0,
            window.innerWidth,
            window.innerHeight,
            1,
            -1,
        ),
        MAIN_WORKSPACE: canvas,
        MOUSE: {x: 0, y: 0},
        SETTINGS: null,
        SOCKET: io(),
        TOUCH_EVENT_HANDLER: Hammer(document.body, hammerOptions),
        VIEWS: [],
        WDEBUG: true,
        WS_OJECTS: [],
        WS_OBJ_ID_STAMPER: new utils.IDStamper(),
    };

    const variables = {
        noUserFound: true,
        temp: 0,
        transforming: false,
    }

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
            set(value) { variables[p] = value; },
            configurable: false,
            enumerable: true
        });
    });

    return Object.freeze(rv);
})();

function onWindowLoad() {
    globals.MAIN_WORKSPACE.width = window.innerWidth;
    globals.MAIN_WORKSPACE.height = window.innerHeight;

    /*
     * XXX: Are we sure we want to do this right away?
     */
    window.setInterval(main_wsDraw, globals.FRAMERATE);

    /*
     * XXX: Why do these listeners need to be attached all the way down here
     *      instead of adjacent to the initialization of the socket variable?
     */
    globals.SOCKET.on('init', onInit);
    globals.SOCKET.on('updateUser', onUpdateUser);
    globals.SOCKET.on('removeUser', onRemoveUser);
    globals.SOCKET.on('updateObjects', onUpdateObjects);
    globals.SOCKET.on('message', (message) => {
        if (message === globals.EVENT_DC_USER) {
            document.body.innerHTML = "<H1>" +
                "Application has reached capacity." +
                "</H1>";
        }
    });
}

/*
 * XXX: Oh my, is this 'class' given the same name as the server-side class,
 *      but with different functionality? This might break my brain a bit.
 *
 *      Is it possible to define a central 'View' class that both are able
 *      to extend? How would that work, given that one of the ViewSpaces is
 *      sent to the client and the other is used by the server?
 */
function ViewSpace(x, y, w, h, scale, id) {
    /*
     * XXX: Like in the server side ViewSpace, should update the variable
     *      names.
     */
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.scale = scale;
    this.ew = w/scale;
    this.eh = h/scale;
    this.id = id;
    this.subViews = [];
}

ViewSpace.prototype.reportView = function(reportSubWS) {
    const vsInfo = {
        x: this.x,
        y: this.y,
        w: this.w,
        h: this.h,
        ew: this.ew,
        eh: this.eh,
        scale: this.scale,
        id: this.id
    };

    /*
     * XXX: Do we want to connect the subviews in this view somehow, so that
     *      they are clearly linked in the report?
     */
    if (reportSubWS) {
        this.subViews.forEach( subWS => subWS.reportView(true) );
    }

    globals.SOCKET.emit('reportView', vsInfo);
}

/*
 * XXX: Okay, I'll need to dig into the canvas API if I'm going to understand
 *      this.
 */
function globals.MAIN_WORKSPACEDraw() {
    // Clear old globals.MAIN_WORKSPACE
    globals.CANVAS_CONTEXT.clearRect(0, 0, globals.MAIN_WORKSPACE.getWidth(), globals.MAIN_WORKSPACE.getHeight());
    globals.CANVAS_CONTEXT.save();
    globals.CANVAS_CONTEXT.scale(globals.MAIN_VIEWSPACE.scale, globals.MAIN_VIEWSPACE.scale);

    globals.CANVAS_CONTEXT.translate(-globals.MAIN_VIEWSPACE.x, -globals.MAIN_VIEWSPACE.y);
    globals.CANVAS_CONTEXT.rotate(globals.MAIN_VIEWSPACE.rotation);

    /*
     * XXX: I think maybe this should be a 'rotate' function.
     */
    switch(globals.MAIN_VIEWSPACE.rotation) {
        case(0): break;
        case(Math.PI): globals.CANVAS_CONTEXT.translate((-globals.MAIN_VIEWSPACE.ew - globals.MAIN_VIEWSPACE.x*2), (-globals.MAIN_VIEWSPACE.eh - globals.MAIN_VIEWSPACE.y*2)); break;
        case(Math.PI/2): globals.CANVAS_CONTEXT.translate(-globals.MAIN_VIEWSPACE.ew, -globals.MAIN_VIEWSPACE.x*2); break;
        case(3*Math.PI/2): globals.CANVAS_CONTEXT.translate(-globals.MAIN_VIEWSPACE.y*2, -globals.MAIN_VIEWSPACE.ew); break;
    }

    /*
     * XXX: Each WSObject should have a draw() function defined on it, which
     *      can then be called from inside a simple forEach().
     */
    for (let i = 0; i < globals.WS_OBJECTS.length; i++) {
        //console.log(globals.WS_OBJECTS);
        if (globals.WS_OBJECTS[i].w != null && globals.WS_OBJECTS[i].h != null) {
            if (globals.WS_OBJECTS[i].imgsrc) {
                globals.CANVAS_CONTEXT.drawImage(globals.IMAGES[globals.WS_OBJECTS[i].id], globals.WS_OBJECTS[i].x, globals.WS_OBJECTS[i].y, globals.WS_OBJECTS[i].w, globals.WS_OBJECTS[i].h);
            } else {   
            //console.log(globals.WS_OBJECTS[i].draw);
                /*
                 * XXX: Yikes!!! eval()? And we want this to be a usable API?
                 *      For people to work together over networks? Pardon my
                 *      French, but how the f*** are we going to make sure that
                 *      no one is injecting malicious code here? 
                 *
                 *      Where is draw defined, and how does it end up here?
                 *
                 *      There must be a better way...
                 */
                eval(globals.WS_OBJECTS[i].draw+';');
                eval(globals.WS_OBJECTS[i].drawStart+';');
            }
        } else {
            if (globals.WS_OBJECTS[i].imgsrc) {
                globals.CANVAS_CONTEXT.drawImage(globals.IMAGES[globals.WS_OBJECTS[i].id], globals.WS_OBJECTS[i].x, globals.WS_OBJECTS[i].y);
            } else {
                /*
                 * XXX: Same eval() complaint as above, but with the added
                 *      complaint that this is duplicated code.
                 */
                eval(globals.WS_OBJECTS[i].draw+';');
                eval(globals.WS_OBJECTS[i].startStart+';');
            }
        }

    }

    /*
     * XXX: What exactly is going on here? Is this where we draw the rectangles
     *      showing users where the other users are looking?
     */
    for (let i = 0; i < globals.VIEWS.length; i++) {
        globals.CANVAS_CONTEXT.beginPath();
        globals.CANVAS_CONTEXT.rect(globals.VIEWS[i].x, globals.VIEWS[i].y, globals.VIEWS[i].ew, globals.VIEWS[i].eh);
        globals.CANVAS_CONTEXT.stroke();
    }

    globals.CANVAS_CONTEXT.restore();

    /*
     * XXX: This should be a function.
     */
    if (globals.SETTINGS != null && globals.SETTINGS.debug) {
        globals.CANVAS_CONTEXT.font = "18px Georgia";
        globals.CANVAS_CONTEXT.fillText("Mouse Coordinates: " + globals.MOUSE.x.toFixed(2) + ", " + globals.MOUSE.y.toFixed(2), 10, 20);
        globals.CANVAS_CONTEXT.fillText("ViewSpace Coordinates: " + globals.MAIN_VIEWSPACE.x.toFixed(2) + ", " + globals.MAIN_VIEWSPACE.y.toFixed(2), 10, 40);
        globals.CANVAS_CONTEXT.fillText("Bottom Right Corner: " + (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.w).toFixed(2) + ", " + (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.h).toFixed(2), 10, 60);
        globals.CANVAS_CONTEXT.fillText("Number of Other Users: " + globals.VIEWS.length, 10, 80);
        globals.CANVAS_CONTEXT.fillText("Viewspace Scale: " + globals.MAIN_VIEWSPACE.scale.toFixed(2), 10, 100);
        globals.CANVAS_CONTEXT.fillText("ViewSpace Rotation: " + globals.MAIN_VIEWSPACE.rotation, 10, 120);
    }
}

window.addEventListener('resize', onResized, false);
function onResized() {
    /*
     * XXX: See here this at least sort of makes sense, yet earlier there was
     *      some kind of globals.MAIN_WORKSPACE.width = globals.MAIN_WORKSPACE.getWidth() nonsense.
     */
    globals.MAIN_WORKSPACE.width = window.innerWidth;
    globals.MAIN_WORKSPACE.height = window.innerHeight;

    /*
     * XXX: globals.MAIN_WORKSPACE is a <canvas>
     *      globals.MAIN_VIEWSPACE is a client-side ViewSpace
     *
     *      Can we clarify this? This really confused me. Is there a reason we
     *      need both?
     */
    globals.MAIN_VIEWSPACE.w = globals.MAIN_WORKSPACE.getWidth();
    globals.MAIN_VIEWSPACE.h = globals.MAIN_WORKSPACE.getHeight();
    globals.MAIN_VIEWSPACE.ew = globals.MAIN_VIEWSPACE.w/globals.MAIN_VIEWSPACE.scale;
    globals.MAIN_VIEWSPACE.eh = globals.MAIN_VIEWSPACE.h/globals.MAIN_VIEWSPACE.scale;
    globals.MAIN_VIEWSPACE.reportView();

}

/*
 * XXX: Can we organize this code to put all the listener attachments together?
 */
window.addEventListener("mousewheel", onMouseScroll, false);
window.addEventListener("DOMMouseScroll", onMouseScroll, false);

function onMouseScroll(ev) {
    /*
     * XXX: Let's have a close look at this. With no comments, I'm not sure
     *      why a Math.max(Math.min()) structure is necessary. We might be able
     *      to simplify this.
     */
    const delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
    const newScale = globals.MAIN_VIEWSPACE.scale + delta*0.09;
    globals.SOCKET.emit('handleScale', globals.MAIN_VIEWSPACE, newScale);
}

/*
 * XXX: I'm not sure I like this approach of attaching the same listener to all
 *      of the events, then 'switch'ing between the events based on type...
 */
globals.TOUCH_EVENT_HANDLER.on('tap dragstart drag dragend transformstart transform transformend', function(ev) {
    ev.preventDefault();
    ev.gesture.preventDefault();
    switch(ev.type) {
        case('tap') :
            globals.MOUSE.x = ev.gesture.center.pageX/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.x;
            globals.MOUSE.y = ev.gesture.center.pageY/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.y;
            /*
             * XXX: Is this code just copy-pasted across three of the cases???
             */
            switch(globals.MAIN_VIEWSPACE.rotation) {
                case(0): break;
                case(Math.PI): 
                    globals.MOUSE.x = globals.MAIN_VIEWSPACE.x + (globals.MAIN_VIEWSPACE.ew * (1 - ((globals.MOUSE.x - globals.MAIN_VIEWSPACE.x)/globals.MAIN_VIEWSPACE.ew))); 
                    globals.MOUSE.y = globals.MAIN_VIEWSPACE.y + (globals.MAIN_VIEWSPACE.eh * (1 - ((globals.MOUSE.y - globals.MAIN_VIEWSPACE.y)/globals.MAIN_VIEWSPACE.eh))); 
                    break;
                case(Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) + (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) - (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
                case(3*Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) - (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) + (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
            }
            globals.SOCKET.emit('handleClick', globals.MOUSE.x, globals.MOUSE.y);
        case 'dragstart':
            globals.MOUSE.x = ev.gesture.center.pageX/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.x;
            globals.MOUSE.y = ev.gesture.center.pageY/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.y;
            switch(globals.MAIN_VIEWSPACE.rotation) {
                case(0): break;
                case(Math.PI): 
                    globals.MOUSE.x = globals.MAIN_VIEWSPACE.x + (globals.MAIN_VIEWSPACE.ew * (1 - ((globals.MOUSE.x - globals.MAIN_VIEWSPACE.x)/globals.MAIN_VIEWSPACE.ew))); 
                    globals.MOUSE.y = globals.MAIN_VIEWSPACE.y + (globals.MAIN_VIEWSPACE.eh * (1 - ((globals.MOUSE.y - globals.MAIN_VIEWSPACE.y)/globals.MAIN_VIEWSPACE.eh)));
                    break;
                case(Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) + (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) - (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
                case(3*Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) - (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) + (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
            }
            break;
        case 'drag':
            /*
             * XXX: Where is globals.transforming defined, where does it get modified?
             *
             *      + Answer: Defined before this listener attachment, modified
             *          about 30 lines down in the transformstart and 
             *          transformend cases.
             */
            if (globals.transforming) {
                return;
            }
            globals.LAST_MOUSE.x = globals.MOUSE.x;
            globals.LAST_MOUSE.y = globals.MOUSE.y;
            globals.MOUSE.x = ev.gesture.center.pageX/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.x;
            globals.MOUSE.y = ev.gesture.center.pageY/globals.MAIN_VIEWSPACE.scale + globals.MAIN_VIEWSPACE.y;
            switch(globals.MAIN_VIEWSPACE.rotation) {
                case(0): break;
                case(Math.PI): 
                    globals.MOUSE.x = globals.MAIN_VIEWSPACE.x + (globals.MAIN_VIEWSPACE.ew * (1 - ((globals.MOUSE.x - globals.MAIN_VIEWSPACE.x)/globals.MAIN_VIEWSPACE.ew))); 
                    globals.MOUSE.y = globals.MAIN_VIEWSPACE.y + (globals.MAIN_VIEWSPACE.eh * (1 - ((globals.MOUSE.y - globals.MAIN_VIEWSPACE.y)/globals.MAIN_VIEWSPACE.eh)));
                    break;
                case(Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) + (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) - (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
                case(3*Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2) - (globals.MOUSE.y - (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2)); 
                    globals.MOUSE.y = (globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2) + (globals.temp - (globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2));
                    break;
            }
            globals.SOCKET.emit('handleDrag', globals.MAIN_VIEWSPACE, globals.MOUSE.x, globals.MOUSE.y, (globals.LAST_MOUSE.x - globals.MOUSE.x), (globals.LAST_MOUSE.y - globals.MOUSE.y));
            break;
        case 'dragend':
            /*
             * XXX: Why listen at all? Is it just to prevent default?
             */
            break;
        case 'transformstart':
            globals.transforming = true;
            startScale = globals.MAIN_VIEWSPACE.scale;
            break;
        case 'transform':
            const scale = ev.gesture.scale;
            const newScale = scale * startScale;
            globals.SOCKET.emit('handleScale', globals.MAIN_VIEWSPACE, newScale);
            break;
        case 'transformend':
            globals.transforming = false;
            startScale = null;
            break;


    }
});

function onInit(initData) {
    globals.SETTINGS = initData.settings;
    /*
     * XXX: Clean this up.
     */
    if (globals.SETTINGS.BGcolor != null) {
        document.getElementById('main').style.backgroundColor = globals.SETTINGS.BGcolor;
    } else {
        document.getElementById('main').style.backgroundColor = "#aaaaaa";
    }

    /*
     * XXX: Look everywhere and make sure that globals.MAIN_VIEWSPACE.id isn't getting
     *      set anywhere else!
     *
     *      Should make sure that all IDs anywhere are immutable once assigned.
     *      Perhaps an 'assignID' function? It could take an object to assign
     *      and an ID generator (preferably also immutable).
     */
    globals.MAIN_VIEWSPACE.id = initData.id;
    for (let i = 0; i < initData.views.length; i++) {
        /*
         * XXX: I'm not exactly sure what's going on here. Are we pushing in
         *      subviews? What are the initData.views? Why are we generating
         *      new ViewSpaces instead of pushing in the ViewSpace from
         *      initData?
         */
        if (initData.views[i].id != globals.MAIN_VIEWSPACE.id) {
            globals.VIEWS.push(new ViewSpace(initData.views[i].x, initData.views[i].y, initData.views[i].w, initData.views[i].h, initData.views[i].scale, initData.views[i].id));
        }
    }

    /*
     * XXX: What kind of Image() is this? Where is it defined?
     */
    for (let i = 0; i < initData.globals.WS_OBJECTS.length; i++) {
        globals.WS_OBJECTS.push(initData.globals.WS_OBJECTS[i]);
        
        if (globals.WS_OBJECTS[i].imgsrc) {
            globals.IMAGES[initData.globals.WS_OBJECTS[i].id] = new Image();
            globals.IMAGES[initData.globals.WS_OBJECTS[i].id].src = initData.globals.WS_OBJECTS[i].imgsrc;
        }
    }

    globals.MAIN_VIEWSPACE.reportView(true);
}

/*
 * XXX: Unless used elsewhere, this global variable should almost certainly be
 *      tucked into the listener.
 *
 *      + Answer: A quick grep reveals that no, it is not used elsewhere. Put
 *          it inside the listener.
 */
function onUpdateUser(vsInfo) {
    // globals.SOCKET.emit('consoleLog', "User: " + globals.MAIN_VIEWSPACE.id + " updating " + vsInfo.id + "'s info.");
    if (vsInfo.id == globals.MAIN_VIEWSPACE.id) {
        globals.MAIN_VIEWSPACE.x = vsInfo.x;
        globals.MAIN_VIEWSPACE.y = vsInfo.y;
        globals.MAIN_VIEWSPACE.w = vsInfo.w;
        globals.MAIN_VIEWSPACE.h = vsInfo.h;
        globals.MAIN_VIEWSPACE.ew = vsInfo.ew;
        globals.MAIN_VIEWSPACE.eh = vsInfo.eh;
        globals.MAIN_VIEWSPACE.scale = vsInfo.scale;
        globals.MAIN_VIEWSPACE.rotation = vsInfo.rotation;
    } else {
        for (let i = 0; i < globals.VIEWS.length; i++) {
            if (globals.VIEWS[i].id == vsInfo.id) {
                globals.noUserFound = false;
                globals.VIEWS[i].x = vsInfo.x;
                globals.VIEWS[i].y = vsInfo.y;
                globals.VIEWS[i].w = vsInfo.w;
                globals.VIEWS[i].h = vsInfo.h;
                globals.VIEWS[i].ew = vsInfo.ew;
                globals.VIEWS[i].eh = vsInfo.eh;
                globals.VIEWS[i].scale = vsInfo.scale;
                globals.VIEWS[i].id = vsInfo.id;
                break;
            }
        }
        if (globals.noUserFound) {
            globals.VIEWS.push(new ViewSpace(vsInfo.x, vsInfo.y, vsInfo.w, vsInfo.h, vsInfo.scale, vsInfo.id));
        }
        globals.noUserFound = true;
    }
}

function onRemoveUser(id) {
    for (let i = 0; i < globals.VIEWS.length; i++) {
        if (globals.VIEWS[i].id == id) {
            globals.VIEWS.remove(i);
            break;
        }
    }
}

/*
 * XXX: Update, eh? If we're just pushing every object from one array into the
 *      other (after it has been emptied), maybe we should just copy the array
 *      over?
 *
 *      I think maybe what happened is the author wanted to actually update
 *      the array, but ran into problems so ended up just resetting. I think
 *      a proper update would probably be more efficient than this mechanism
 *      of trashing, copying, and regenerating.
 */
function onUpdateObjects(objects) {
    globals.WS_OBJECTS = [];
    for (let i = 0; i < objects.length; i++) {
        globals.WS_OBJECTS.push(objects[i]);

        if (globals.WS_OBJECTS[i].imgsrc) {
            globals.IMAGES[objects[i].id] = new Image();
            globals.IMAGES[objects[i].id].src = objects[i].imgsrc;
        }
    }
}

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

HTMLCanvasElement.prototype.getCenter = function() {
    return {
        x : this.getWidth()/2,
        y : this.getHeight()/2
    };
}

