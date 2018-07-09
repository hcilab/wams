/*
 * WAMS code to be executed in the client browser.
 */

/*
 * XXX: General TODO list for myself, as part of code cleanup, bringing this
 *      code up to date:
 *
 *      [ ] Set to use JavaScript's 'strict' mode.
 *          - Do this last, otherwise there will be problems...
 *      [X] Eliminate all use of 'var', replace with 'const' or 'let'.
 *      [X] Organize globals, eliminate where possible.
 *      [ ] Write ID generator factory, use for all IDs.
 *      [X] Switch to using functional style wherever possible, using ES6
 *           standard methods. This should make for more readable code, and
 *           probably faster code too, because the operations will already be
 *           optimized.
 *      [ ] Rename variables where appropriate.
 *      [X] Convert all prototype code into ES6 'class' style.
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

window.addEventListener('DOMMouseScroll', onMouseScroll, false);
window.addEventListener('load', onWindowLoad, false);
window.addEventListener('mousewheel', onMouseScroll, false);
window.addEventListener('resize', onResized, false);

/*
 * XXX: I'm putting this code up here, for now, until I break the code out into
 *      separate source files.
 * XXX: Oh my, is this 'class' given the same name as the server-side class,
 *      but with different functionality? This might break my brain a bit.
 *
 *      Is it possible to define a central 'View' class that both are able
 *      to extend? How would that work, given that one of the ViewSpaces is
 *      sent to the client and the other is used by the server?
 */
class ViewSpace {
    constructor(x, y, w, h, scale, id) {
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

    reportView(reportSubWS) {
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
         * XXX: Do we want to connect the subviews in this view somehow, so 
         *      that they are clearly linked in the report?
         */
        if (reportSubWS) {
            this.subViews.forEach( subWS => subWS.reportView(true) );
        }

        globals.SOCKET.emit('reportView', vsInfo);
    }
}

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
        CANVAS: canvas,
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
        MOUSE: {x: 0, y: 0},
        SOCKET: io(),
        TOUCH_EVENT_HANDLER: Hammer(document.body, hammerOptions),
        VIEWS: [],
        WDEBUG: true,
        WS_OBJECTS: [],
    };

    const variables = {
        settings: null,
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
    globals.CANVAS.width = window.innerWidth;
    globals.CANVAS.height = window.innerHeight;

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
            document.body.innerHTML = '<H1>' +
                'Application has reached capacity.' +
                '</H1>';
        }
    });
}

/*
 * XXX: Okay, I'll need to dig into the canvas API if I'm going to understand
 *      this.
 */
function main_wsDraw() {
    globals.CANVAS_CONTEXT.clearRect(
        0, 
        0, 
        window.innerWidth,
        window.innerHeight
    );
    globals.CANVAS_CONTEXT.save();
    globals.CANVAS_CONTEXT.scale(
        globals.MAIN_VIEWSPACE.scale, 
        globals.MAIN_VIEWSPACE.scale
    );
    globals.CANVAS_CONTEXT.translate(
        -globals.MAIN_VIEWSPACE.x, 
        -globals.MAIN_VIEWSPACE.y
    );
    globals.CANVAS_CONTEXT.rotate(
        globals.MAIN_VIEWSPACE.rotation
    );

    /*
     * XXX: I think maybe this should be a 'rotate' function.
     */
    switch(globals.MAIN_VIEWSPACE.rotation) {
        case(0): 
            break;
        case(Math.PI): 
            globals.CANVAS_CONTEXT.translate(
                (-globals.MAIN_VIEWSPACE.ew - globals.MAIN_VIEWSPACE.x*2), 
                (-globals.MAIN_VIEWSPACE.eh - globals.MAIN_VIEWSPACE.y*2)
            ); 
            break;
        case(Math.PI/2): 
            globals.CANVAS_CONTEXT.translate(
                -globals.MAIN_VIEWSPACE.ew, 
                -globals.MAIN_VIEWSPACE.x*2
            ); 
            break;
        case(3*Math.PI/2): 
            globals.CANVAS_CONTEXT.translate(
                -globals.MAIN_VIEWSPACE.y*2, 
                -globals.MAIN_VIEWSPACE.ew
            ); 
            break;
    }

    /*
     * XXX: Each WSObject should have a draw() function defined on it, which
     *      can then be called from inside a simple forEach().
     */
    globals.WS_OBJECTS.forEach( o => {
        const img = globals.IMAGES[o.id];
        const width = o.w || img.width;
        const height = o.h || img.height;

        if (o.imgsrc) {
            globals.CANVAS_CONTEXT.drawImage(
                img,
                o.x,
                o.y,
                width,
                height
            );
        } else {
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
            eval(`${o.draw};`);
            eval(`${o.drawStart};`);
        }
    });

    /*
     * XXX: What exactly is going on here? Is this where we draw the rectangles
     *      showing users where the other users are looking?
     */
    globals.VIEWS.forEach( v => {
        globals.CANVAS_CONTEXT.beginPath();
        globals.CANVAS_CONTEXT.rect(
            v.x,
            v.y,
            v.ew,
            v.eh
        );
        globals.CANVAS_CONTEXT.stroke();
    });
    globals.CANVAS_CONTEXT.restore();

    /*
     * XXX: This should be a function.
     */
    if (globals.settings != null && globals.settings.debug) {
        globals.CANVAS_CONTEXT.font = '18px Georgia';
        globals.CANVAS_CONTEXT.fillText(
            `Mouse Coordinates: ${globals.MOUSE.x.toFixed(2)}, ` + 
                `${globals.MOUSE.y.toFixed(2)}`, 
            10, 
            20
        );
        globals.CANVAS_CONTEXT.fillText(
            `ViewSpace Coordinates: ${globals.MAIN_VIEWSPACE.x.toFixed(2)}, ` + 
                `${globals.MAIN_VIEWSPACE.y.toFixed(2)}`, 
            10, 
            40
        );
        globals.CANVAS_CONTEXT.fillText(
            `Bottom Right Corner: ${(globals.MAIN_VIEWSPACE.x + 
                globals.MAIN_VIEWSPACE.w).toFixed(2)}, ` + 
                `${(globals.MAIN_VIEWSPACE.y + 
                globals.MAIN_VIEWSPACE.h).toFixed(2)}`,
            10, 
            60);
        globals.CANVAS_CONTEXT.fillText(
            `Number of Other Users: ${globals.VIEWS.length}`, 
            10, 
            80
        );
        globals.CANVAS_CONTEXT.fillText(
            `Viewspace Scale: ${globals.MAIN_VIEWSPACE.scale.toFixed(2)}`, 
            10, 
            100
        );
        globals.CANVAS_CONTEXT.fillText(
            `ViewSpace Rotation: ${globals.MAIN_VIEWSPACE.rotation}`, 
            10, 
            120
        );
    }
}

function onResized() {
    globals.CANVAS.width = window.innerWidth;
    globals.CANVAS.height = window.innerHeight;
    globals.MAIN_VIEWSPACE.w = window.innerWidth;
    globals.MAIN_VIEWSPACE.h = window.innerHeight;
    globals.MAIN_VIEWSPACE.ew = 
        globals.MAIN_VIEWSPACE.w/globals.MAIN_VIEWSPACE.scale;
    globals.MAIN_VIEWSPACE.eh = 
        globals.MAIN_VIEWSPACE.h/globals.MAIN_VIEWSPACE.scale;
    globals.MAIN_VIEWSPACE.reportView();

}

/*
 * XXX: Can we organize this code to put all the listener attachments together?
 */

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
globals.TOUCH_EVENT_HANDLER.on(
    'tap dragstart drag dragend transformstart transform transformend', 
    function(ev) {
        function rotate(rotation) {
            switch (rotation) {
                case(0): break;
                case(Math.PI): 
                    globals.MOUSE.x = globals.MAIN_VIEWSPACE.x + (
                        globals.MAIN_VIEWSPACE.ew * (
                            1 - (
                                (
                                    globals.MOUSE.x - globals.MAIN_VIEWSPACE.x
                                ) / globals.MAIN_VIEWSPACE.ew
                            )
                        )
                    ); 
                    globals.MOUSE.y = globals.MAIN_VIEWSPACE.y + (
                        globals.MAIN_VIEWSPACE.eh * (
                            1 - (
                                (
                                    globals.MOUSE.y - globals.MAIN_VIEWSPACE.y
                                ) / globals.MAIN_VIEWSPACE.eh
                            )
                        )
                    ); 
                    break;
                case(Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (
                        globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2
                    ) + (
                        globals.MOUSE.y - (
                            globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2
                        )
                    ); 
                    globals.MOUSE.y = (
                        globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2
                    ) - (
                        globals.temp - (
                            globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2
                        )
                    );
                    break;
                case(3*Math.PI/2): 
                    globals.temp = globals.MOUSE.x;
                    globals.MOUSE.x = (
                        globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2
                    ) - (
                        globals.MOUSE.y - (
                            globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2
                        )
                    ); 
                    globals.MOUSE.y = (
                        globals.MAIN_VIEWSPACE.y + globals.MAIN_VIEWSPACE.eh/2
                    ) + (
                        globals.temp - (
                            globals.MAIN_VIEWSPACE.x + globals.MAIN_VIEWSPACE.ew/2
                        )
                    );
                    break;
            }
        }

        ev.preventDefault();
        ev.gesture.preventDefault();
        switch(ev.type) {
            case('tap') :
                globals.MOUSE.x = 
                    ev.gesture.center.pageX/globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.x;
                globals.MOUSE.y = 
                    ev.gesture.center.pageY/globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.y;

                rotate(globals.MAIN_VIEWSPACE.rotation);

                globals.SOCKET.emit(
                    'handleClick', 
                    globals.MOUSE.x, 
                    globals.MOUSE.y
                );
            case 'dragstart':
                globals.MOUSE.x = ev.gesture.center.pageX/
                    globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.x;
                globals.MOUSE.y = ev.gesture.center.pageY/
                    globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.y;

                rotate(globals.MAIN_VIEWSPACE.rotation);
                
                break;
            case 'drag':
                /*
                 * XXX: Where is globals.transforming defined, where does it 
                 *      get modified?
                 *
                 *      + Answer: Defined before this listener attachment, 
                 *          modified about 30 lines down in the transformstart 
                 *          and transformend cases.
                 */
                if (globals.transforming) {
                    return;
                }

                globals.LAST_MOUSE.x = globals.MOUSE.x;
                globals.LAST_MOUSE.y = globals.MOUSE.y;
                globals.MOUSE.x = 
                    ev.gesture.center.pageX/globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.x;
                globals.MOUSE.y = 
                    ev.gesture.center.pageY/globals.MAIN_VIEWSPACE.scale + 
                    globals.MAIN_VIEWSPACE.y;

                rotate(globals.MAIN_VIEWSPACE.rotation);
                
                globals.SOCKET.emit('handleDrag', 
                    globals.MAIN_VIEWSPACE, 
                    globals.MOUSE.x, 
                    globals.MOUSE.y, 
                    (globals.LAST_MOUSE.x - globals.MOUSE.x), 
                    (globals.LAST_MOUSE.y - globals.MOUSE.y)
                );
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
                globals.SOCKET.emit(
                    'handleScale', 
                    globals.MAIN_VIEWSPACE, 
                    newScale
                );
                break;
            case 'transformend':
                globals.transforming = false;
                startScale = null;
                break;


        }
    });

function onInit(initData) {
    globals.settings = initData.settings;
    /*
     * XXX: Clean this up.
     */
    if (globals.settings.BGcolor != null) {
        document.getElementById('main').style.backgroundColor = 
            globals.settings.BGcolor;
    } else {
        document.getElementById('main').style.backgroundColor = '#aaaaaa';
    }

    /*
     * XXX: Look everywhere and make sure that globals.MAIN_VIEWSPACE.id isn't 
     *      getting set anywhere else!
     *
     *      Should make sure that all IDs anywhere are immutable once assigned.
     *      Perhaps an 'assignID' function? It could take an object to assign
     *      and an ID generator (preferably also immutable).
     */
    globals.MAIN_VIEWSPACE.id = initData.id;
    initData.views.forEach( v => {
        /*
         * XXX: I'm not exactly sure what's going on here. Are we pushing in
         *      subviews? What are the initData.views? Why are we generating
         *      new ViewSpaces instead of pushing in the ViewSpace from
         *      initData?
         */
        if (v.id !== globals.MAIN_VIEWSPACE.id) {
            globals.VIEWS.push(
                new ViewSpace(
                    v.x, 
                    v.y, 
                    v.w, 
                    v.h, 
                    v.scale, 
                    v.id
                )
            );
        }
    });

    /*
     * XXX: What kind of Image() is this? Where is it defined?
     *
     *      + Answer: Turns out, this is part of the DOM API!! You can
     *          generate <img> elements by calling new Image()! Pretty cool
     *          actually! I'll probably make use of that!
     */
    initData.wsObjects.forEach( o => {
        globals.WS_OBJECTS.push(o);
        if (o.imgsrc) {
            globals.IMAGES[o.id] = new Image();
            globals.IMAGES[o.id].src = o.imgsrc;
        }
    });

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
        const noUserFound = !globals.VIEWS.some( v => {
            if (v.id === vsInfo.id) {
                v.x = vsInfo.x;
                v.y = vsInfo.y;
                v.w = vsInfo.w;
                v.h = vsInfo.h;
                v.ew = vsInfo.ew;
                v.eh = vsInfo.eh;
                v.scale = vsInfo.scale;
                v.id = vsInfo.id;
                return true;
            }
            return false;
        });

        if (noUserFound) {
            globals.VIEWS.push(
                new ViewSpace(
                    vsInfo.x, 
                    vsInfo.y, 
                    vsInfo.w, 
                    vsInfo.h, 
                    vsInfo.scale, 
                    vsInfo.id
                )
            );
        }
    }
}

function onRemoveUser(id) {
    const index = globals.VIEWS.findIndex( v => v.id === id );
    if (index >= 0) {
        globals.VIEWS.splice(index,1);
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

    objects.forEach( o => {
        globals.WS_OBJECTS.push(o);

        if (o.imgsrc) {
            globals.IMAGES[o.id] = new Image();
            globals.IMAGES[o.id].src = o.imgsrc;
        }
    });
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

