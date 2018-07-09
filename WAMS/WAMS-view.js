/*
 * WAMS code to be executed in the client browser.
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
 *      [ ] Write ID generator factory, use for all IDs.
 *      [X] Switch to using functional style wherever possible, using ES6
 *           standard methods. This should make for more readable code, and
 *           probably faster code too, because the operations will already be
 *           optimized.
 *      [X] Rename variables where appropriate.
 *      [X] Convert all prototype code into ES6 'class' style.
 *          - Better readability, extensibility.
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

window.addEventListener(
    'load', 
    function run() {
        new ClientViewSpace(
            0,
            0,
            window.innerWidth,
            window.innerHeight,
            1,
            -1,
        ).onWindowLoad();
    },
    {
        capture: false,
        once: true,
        passive: true,
    }
);

/*
 * XXX: I'm putting this code up here, for now, until I break the code out into
 *      separate source files.
 * XXX: Oh my, is this 'class' given the same name as the server-side class,
 *      but with different functionality? This might break my brain a bit.
 *
 *      Is it possible to define a central 'View' class that both are able
 *      to extend? How would that work, given that one of the ViewSpaces 
 *      is sent to the client and the other is used by the server?
 */
class ClientViewSpace {
    constructor(x, y, width, height, scale, id) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.scale = scale;
        this.effectiveWidth = width/scale;
        this.effectiveHeight = height/scale;
        this.id = id;
        this.subViews = [];

        this.canvas = document.querySelector('#main');
        this.context = this.canvas.getContext('2d');
        this.rotation = 0;
        this.wsObjects = [];
        this.startScale = this.scale;
    }

    reportView(reportSubWS) {
        const vsInfo = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            effectiveWidth: this.effectiveWidth,
            effectiveHeight: this.effectiveHeight,
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

    /*
     * XXX: Okay, I'll need to dig into the canvas API if I'm going to understand
     *      this.
     */
    draw() {
        function setOrientation() {
            switch(this.rotation) {
                case(0): 
                    break;
                case(Math.PI): 
                    this.context.translate(
                        (-this.effectiveWidth - this.x*2), 
                        (-this.effectiveHeight - this.y*2)
                    ); 
                    break;
                case(Math.PI/2): 
                    this.context.translate(
                        -this.effectiveWidth, 
                        -this.x*2
                    ); 
                    break;
                case(3*Math.PI/2): 
                    this.context.translate(
                        -this.y*2, 
                        -this.effectiveWidth
                    ); 
                    break;
            }
        }

        this.context.clearRect(
            0, 
            0, 
            window.innerWidth,
            window.innerHeight
        );
        
        this.context.save();

        this.context.scale(
            this.scale, 
            this.scale
        );
        this.context.translate(
            -this.x, 
            -this.y
        );
        this.context.rotate(this.rotation);

        setOrientation.call(this);

        /*
         * XXX: Each WSObject should have a draw() function defined on it, which
         *      can then be called from inside a simple forEach().
         */
        this.wsObjects.forEach( o => {
            const img = globals.IMAGES[o.id];
            const width = o.width || img.width;
            const height = o.height || img.height;

            if (o.imgsrc) {
                this.context.drawImage(
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
            this.context.beginPath();
            this.context.rect(
                v.x,
                v.y,
                v.effectiveWidth,
                v.effectiveHeight
            );
            this.context.stroke();
        });
        this.context.restore();

        this.showStatus();
    }

    showStatus() {
        /*
         * XXX: This should be a function.
         */
        if (globals.settings !== null && globals.settings.debug) {
            this.context.font = '18px Georgia';
            this.context.fillText(
                `Mouse Coordinates: ${globals.MOUSE.x.toFixed(2)}, ` + 
                    `${globals.MOUSE.y.toFixed(2)}`, 
                10, 
                20
            );
            this.context.fillText(
                `ClientViewSpace Coordinates: ${this.x.toFixed(2)}, ` + 
                    `${this.y.toFixed(2)}`, 
                10, 
                40
            );
            this.context.fillText(
                `Bottom Right Corner: ${(this.x + this.width).toFixed(2)}, ` + 
                    `${(this.y + this.height).toFixed(2)}`,
                10, 
                60);
            this.context.fillText(
                `Number of Other Users: ${globals.VIEWS.length}`, 
                10, 
                80
            );
            this.context.fillText(
                `Viewspace Scale: ${this.scale.toFixed(2)}`, 
                10, 
                100
            );
            this.context.fillText(
                `ClientViewSpace Rotation: ${this.rotation}`, 
                10, 
                120
            );
        }
    }

    onMouseScroll(event) {
        /*
         * XXX: Let's have a close look at this. With no comments, I'm not sure
         *      why a Math.max(Math.min()) structure is necessary. We might be 
         *      able to simplify this.
         */
        const delta = Math.max(
            -1, 
            Math.min(
                1, 
                (event.wheelDelta || -event.detail)
            )
        );
        const newScale = this.scale + delta * 0.09;
        globals.SOCKET.emit('handleScale', this, newScale);
    }

    onResized(event) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width; 
        this.canvas.height = this.height;
        this.effectiveWidth = this.width / this.scale;
        this.effectiveHeight = this.height / this.scale;
        this.reportView();
    }

    setMouse(event) {
        switch (this.rotation) {
            case(0): break;
            case(Math.PI): 
                /*
                 * XXX: This is _nasty_.
                 *      This math can almost certainly be cleaned up.
                 *
                 *      let mx = globals.MOUSE.x
                 *      let x = this.x
                 *      let ew = this.effectiveWidth
                 *      let old = globals.MOUSE.x (before assignment).
                 *
                 *      mx = x + (ew * [1 - {(old - x) / ew}])
                 *      mx = x + ew - {[ew * (old - x)] / ew}
                 *      mx = x + ew - (old - x)
                 *      mx = x + ew - old + x
                 *      mx = 2x + ew - old
                 *
                 *      See? Much simpler. What exactly this math is supposed
                 *      to represent is still beyond me though. This code reeks
                 *      to high heaven.
                 */
                globals.MOUSE.x = this.x + (
                    this.effectiveWidth * (
                        1 - (
                            (
                                globals.MOUSE.x - this.x
                            ) / this.effectiveWidth
                        )
                    )
                ); 
                globals.MOUSE.y = this.y + (
                    this.effectiveHeight * (
                        1 - (
                            (
                                globals.MOUSE.y - this.y
                            ) / this.effectiveHeight
                        )
                    )
                ); 
                break;
            case(Math.PI/2): 
                globals.temp = globals.MOUSE.x;
                globals.MOUSE.x = (
                    this.x + this.effectiveWidth/2
                ) + (
                    globals.MOUSE.y - (
                        this.y + this.effectiveHeight/2
                    )
                ); 
                globals.MOUSE.y = (
                    this.y + this.effectiveHeight/2
                ) - (
                    globals.temp - (
                        this.x + this.effectiveWidth/2
                    )
                );
                break;
            case(3*Math.PI/2): 
                globals.temp = globals.MOUSE.x;
                globals.MOUSE.x = (
                    this.x + this.effectiveWidth/2
                ) - (
                    globals.MOUSE.y - (
                        this.y + this.effectiveHeight/2
                    )
                ); 
                globals.MOUSE.y = (
                    this.y + this.effectiveHeight/2
                ) + (
                    globals.temp - (
                        this.x + this.effectiveWidth/2
                    )
                );
                break;
        }
    }

    ontap(event) {
        globals.MOUSE.x = event.gesture.center.pageX / this.scale + this.x;
        globals.MOUSE.y = event.gesture.center.pageY / this.scale + this.y;

        this.setMouse();

        globals.SOCKET.emit(
            'handleClick', 
            globals.MOUSE.x, 
            globals.MOUSE.y
        );
    }

    ondragstart(event) {
        globals.MOUSE.x = event.gesture.center.pageX / this.scale + this.x;
        globals.MOUSE.y = event.gesture.center.pageY / this.scale + this.y;

        this.setMouse();
    }

    ondrag(event) {
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
        globals.MOUSE.x = event.gesture.center.pageX / this.scale + this.x;
        globals.MOUSE.y = event.gesture.center.pageY / this.scale + this.y;

        this.setMouse();
        
        globals.SOCKET.emit('handleDrag', 
            this, 
            globals.MOUSE.x, 
            globals.MOUSE.y, 
            (globals.LAST_MOUSE.x - globals.MOUSE.x), 
            (globals.LAST_MOUSE.y - globals.MOUSE.y)
        );
    }

    ondragend(event) {
        /*
         * NOP for now, here for consistency though.
         */
    }

    ontransformstart(event) {
        globals.transforming = true;
        this.startScale = this.scale;
    }

    ontransform(event) {
        globals.SOCKET.emit(
            'handleScale', 
            this, 
            event.gesture.scale * this.startScale
        );
    }

    ontransformend(event) {
        globals.transforming = false;
        this.startScale = null;
    }

    onInit(initData) {
        globals.settings = initData.settings;
        /*
         * XXX: Clean this up.
         */
        if (globals.settings.BGcolor !== null) {
            document.getElementById('main').style.backgroundColor = 
                globals.settings.BGcolor;
        } else {
            document.getElementById('main').style.backgroundColor = '#aaaaaa';
        }

        /*
         * XXX: Look everywhere and make sure that this.id 
         *      isn't getting set anywhere else!
         *
         *      Should make sure that all IDs anywhere are immutable once 
         *      assigned. Perhaps an 'assignID' function? It could take an 
         *      object to assign and an ID generator (preferably also 
         *      immutable).
         */
        this.id = initData.id;
        initData.views.forEach( v => {
            /*
             * XXX: I'm not exactly sure what's going on here. Are we pushing 
             *      in subviews? What are the initData.views? Why are we 
             *      generating new ClientViewSpaces instead of pushing in the 
             *      ClientViewSpace from initData?
             */
            if (v.id !== this.id) {
                globals.VIEWS.push(
                    new ClientViewSpace(
                        v.x, 
                        v.y, 
                        v.width, 
                        v.height, 
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
            this.wsObjects.push(o);
            if (o.imgsrc) {
                globals.IMAGES[o.id] = new Image();
                globals.IMAGES[o.id].src = o.imgsrc;
            }
        });

        this.reportView(true);
    }

    onUpdateUser(vsInfo) {
        if (vsInfo.id === this.id) {
            this.x = vsInfo.x;
            this.y = vsInfo.y;
            this.width = vsInfo.width;
            this.height = vsInfo.height;
            this.effectiveWidth = vsInfo.effectiveWidth;
            this.effectiveHeight = vsInfo.effectiveHeight;
            this.scale = vsInfo.scale;
            this.rotation = vsInfo.rotation;
        } else {
            const noUserFound = !globals.VIEWS.some( v => {
                if (v.id === vsInfo.id) {
                    v.x = vsInfo.x;
                    v.y = vsInfo.y;
                    v.width = vsInfo.width;
                    v.height = vsInfo.height;
                    v.effectiveWidth = vsInfo.effectiveWidth;
                    v.effectiveHeight = vsInfo.effectiveHeight;
                    v.scale = vsInfo.scale;
                    v.id = vsInfo.id;
                    return true;
                }
                return false;
            });

            if (noUserFound) {
                globals.VIEWS.push(
                    new ClientViewSpace(
                        vsInfo.x, 
                        vsInfo.y, 
                        vsInfo.width, 
                        vsInfo.height, 
                        vsInfo.scale, 
                        vsInfo.id
                    )
                );
            }
        }
    }

    onRemoveUser(id) {
        const index = globals.VIEWS.findIndex( v => v.id === id );
        if (index >= 0) {
            globals.VIEWS.splice(index,1);
        }
    }

    /*
     * XXX: Update, effectiveHeight? If we're just pushing every object from one 
     *      array into the other (after it has been emptied), maybe we should just 
     *      copy the array over?
     *
     *      I think maybe what happened is the author wanted to actually update
     *      the array, but ran into problems so ended up just resetting. I think
     *      a proper update would probably be more efficient than this mechanism
     *      of trashing, copying, and regenerating.
     */
    onUpdateObjects(objects) {
        this.wsObjects.splice(0, this.wsObjects.length);

        objects.forEach( o => {
            this.wsObjects.push(o);

            if (o.imgsrc) {
                globals.IMAGES[o.id] = new Image();
                globals.IMAGES[o.id].src = o.imgsrc;
            }
        });
    }

    onWindowLoad() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        /*
         * XXX: Are we sure we want to do this right away?
         */
        window.setInterval(this.draw.bind(this), globals.FRAMERATE);

        /*
         * XXX: Why do these listeners need to be attached all the way down here
         *      instead of adjacent to the initialization of the socket variable?
         */
        globals.SOCKET.on('init', this.onInit.bind(this));
        globals.SOCKET.on('updateUser', this.onUpdateUser.bind(this));
        globals.SOCKET.on('removeUser', this.onRemoveUser.bind(this));
        globals.SOCKET.on('updateObjects', this.onUpdateObjects.bind(this));
        globals.SOCKET.on('message', (message) => {
            if (message === globals.EVENT_DC_USER) {
                document.body.innerHTML = '<H1>' +
                    'Application has reached capacity.' +
                    '</H1>';
            }
        });

        window.addEventListener(
            'DOMMouseScroll', 
            this.onMouseScroll.bind(this), 
            false
        );
        window.addEventListener(
            'mousewheel', 
            this.onMouseScroll.bind(this), 
            false
        );
        window.addEventListener(
            'resize', 
            this.onResized.bind(this), 
            false
        );

        // Hammer listeners.
        function preventGestureEventDefaults(e) {
            e.preventDefault();
            e.gesture.preventDefault();
        }

        const hammer = Hammer(document.body, {
            dragLockToAxis : true,
            dragBlockHorizontal : true,
            preventDefault : true,
            transform_always_block: true,
            transform_min_scale: 1,
            drag_block_horizontal: true,
            drag_block_vertical: true,
            drag_min_distance: 0
        });

        [
            'tap',
            'dragstart',
            'drag',
            'dragend',
            'transformstart',
            'transform',
            'transformend',
        ].forEach( e => {
            hammer.on(e, preventGestureEventDefaults);
            hammer.on(e, this[`on${e}`].bind(this));
        });
    }

}

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
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
        MOUSE: {x: 0, y: 0},
        SOCKET: io(),
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


