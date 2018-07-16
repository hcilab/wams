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
 */

/*
 * I'm using a frozen 'globals' object with all global constants and variables 
 * defined as properties on it, to make global references explicit. I've been 
 * toying with this design pattern in my other JavaScript code and I think I 
 * quite like it.
 */
const globals = (function defineGlobals() {
    const canvas = document.querySelector('#main');
    const constants = {
        FRAMERATE: 1000 / 60,
        ROTATE_0: 0,
        ROTATE_90: Math.PI / 2,
        ROTATE_180: Math.PI,
        ROTATE_270: Math.PI * 1.5,
        SOCKET: io(),
        VS_ID_STAMPER: new WamsShared.IDStamper(),
        OBJ_ID_STAMPER: new WamsShared.IDStamper(),
    };

    const variables = {
        settings: null,
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

    /*
     * I centralized the event descriptions in the shared file, so collect them
     * from there.
     */
    Object.entries(WamsShared.events).forEach( ([p,v]) => {
        Object.defineProperty(rv, p, {
            value: v,
            configurable: false,
            enumerable: true,
            writable: false
        });
    });

    return Object.freeze(rv);
})();

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
const ClientViewSpace = (function defineClientViewSpace() {
    const defaults = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        effectiveWidth: window.innerWidth,
        effectiveHeight: window.innerHeight,
        rotation: globals.ROTATE_0,
        scale: 1,
    };

    class ClientViewSpace extends WamsShared.ViewSpace {
        constructor(data) {
            super(WamsShared.initialize(defaults, data));
            this.canvas = document.querySelector('#main');
            this.context = this.canvas.getContext('2d');
            this.wsObjects = [];
            this.subViews = [];
            this.startScale = null;
            this.transforming = false;
            this.mouse = {x: 0, y: 0};
            this.otherUsers = [];
        }

        /*
         * XXX: What kind of Image() is this? Where is it defined?
         *
         *      + Answer: Turns out, this is part of the DOM API!! You can
         *          generate <img> elements by calling new Image()! Pretty cool
         *          actually! I'll probably make use of that!
         */
        addObject(obj) {
            this.wsObjects.push(new ClientWSObject(obj));
        }

        /*
         * XXX: These can probably be some kind of "shadow" viewspace,
         *      as very little of their data seems to be needed.
         */
        addUser(info) {
            const nvs = new ViewSpace().assign(info);
            globals.VS_ID_STAMPER.stamp(nvs, info.id);
            this.otherUsers.push(nvs);
        }

        /*
         * XXX: Okay, I'll need to dig into the canvas API if I'm going to 
         *      understand this.
         */
        draw() {
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

            this.setOrientation();

            /*
             * XXX: Each WSObject should have a draw() function defined on it, 
             *      which can then be called from inside a simple forEach().
             */
            this.wsObjects.forEach( o => o.draw() );

            /*
             * XXX: What exactly is going on here? Is this where we draw the 
             *      rectangles showing users where the other users are looking?
             */
            this.otherUsers.forEach( v => {
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

        getMouseCoordinates(event) {
            const base = {
                x: event.center.x / this.scale + this.x,
                y: event.center.y / this.scale + this.y,
            };

            const center = {
                x: (this.effectiveWidth / 2) + this.x,
                y: (this.effectiveHeight / 2) + this.y,
            };

            const coords = {
                x: -1, 
                y: -1,
            };

            /*
             * XXX: Still need to figure out the "why" of this math. Once I've 
             *      done that, I will write up a comment explaining it.
             */
            switch (this.rotation) {
                case(globals.ROTATE_0): 
                    coords.x = base.x;
                    coords.y = base.y;
                    break;
                case(globals.ROTATE_90): 
                    coords.x = (2 * this.x) + this.effectiveWidth - base.x;
                    coords.y = (2 * this.y) + this.effectiveHeight - base.y;
                    break;
                case(globals.ROTATE_180):
                    coords.x = center.x - center.y + base.y;
                    coords.y = center.y + center.x - base.x;
                    break;
                case(globals.ROTATE_270): 
                    coords.x = center.x + center.y - base.y;
                    coords.y = center.y - center.x + base.x;
                    break;
            }

            return coords;
        }

        reportView(reportSubWS) {
            /*
             * XXX: Do we want to connect the subviews in this view somehow, so 
             *      that they are clearly linked in the report?
             */
            if (reportSubWS) {
                this.subViews.forEach( subWS => subWS.reportView(true) );
            }

            globals.SOCKET.emit('reportView', this.report());
        }

        setOrientation() {
            switch(this.rotation) {
                case(globals.ROTATE_0): 
                    break;
                case(globals.ROTATE_90): 
                    this.context.translate(
                        (-this.effectiveWidth - (this.x * 2)), 
                        (-this.effectiveHeight - (this.y * 2))
                    ); 
                    break;
                case(globals.ROTATE_180): 
                    this.context.translate(
                        -this.effectiveWidth, 
                        -(this.x * 2)
                    ); 
                    break;
                case(globals.ROTATE_270): 
                    this.context.translate(
                        -(this.y * 2), 
                        -this.effectiveWidth
                    ); 
                    break;
            }
        }

        showStatus() {
            /*
             * XXX: This should be a function.
             */
            if (globals.settings !== null && globals.settings.debug) {
                this.context.font = '18px Georgia';
                this.context.fillText(
                    `ClientViewSpace Coordinates: ${this.x.toFixed(2)}, ` + 
                        `${this.y.toFixed(2)}`, 
                    10, 
                    40
                );
                this.context.fillText(
                    `Bottom Right Corner: ` +
                        `${(this.x + this.width).toFixed(2)}, ` + 
                        `${(this.y + this.height).toFixed(2)}`,
                    10, 
                    60);
                this.context.fillText(
                    `Number of Other Users: ${this.otherUsers.length}`, 
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

        ondrag(event) {
            if (this.transforming) {
                return;
            }

            const lastMouse = this.mouse;
            this.mouse = this.getMouseCoordinates(event);
            
            globals.SOCKET.emit('handleDrag', 
                this, 
                this.mouse.x,
                this.mouse.y,
                (lastMouse.x - this.mouse.x), 
                (lastMouse.y - this.mouse.y)
            );
        }

        ondragend(event) {
            /*
             * NOP for now, here for consistency though.
             */
        }

        ondragstart(event) {
            this.mouse = this.getMouseCoordinates(event);
        }

        onInit(initData) {
            globals.settings = initData.settings;
            this.canvas.style.backgroundColor = globals.settings.BGcolor;
            globals.VS_ID_STAMPER.stamp(this, initData.id);
            initData.views.forEach( v => {
                if (v.id !== this.id) this.addUser(v);
            });
            initData.wsObjects.forEach( o => this.addObject(o) );
            this.reportView(true);
        }

        onMouseScroll(event) {
            /*
             * XXX: Let's have a close look at this. With no comments, I'm not 
             *      sure why a Math.max(Math.min()) structure is necessary. We 
             *      might be able to simplify this.
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

        onRemoveUser(id) {
            const index = this.otherUsers.findIndex( v => v.id === id );
            if (index >= 0) {
                this.otherUsers.splice(index,1);
            }
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

        ontap(event) {
            this.mouse = this.getMouseCoordinates(event);

            globals.SOCKET.emit(
                'handleClick', 
                this.mouse.x,
                this.mouse.y
            );
        }

        ontransform(event) {
            globals.SOCKET.emit(
                'handleScale', 
                this, 
                event.scale * this.startScale
            );
        }

        ontransformend(event) {
            this.transforming = false;
            this.startScale = null;
        }

        ontransformstart(event) {
            this.transforming = true;
            this.startScale = this.scale;
        }

        /*
         * XXX: Update? If we're just pushing every object 
         *      from one array into the other (after it has been emptied), 
         *      maybe we should just copy the array over?
         *
         *      I think maybe what happened is the author wanted to actually 
         *      update the array, but ran into problems so ended up just 
         *      resetting. I think a proper update would probably be more 
         *      efficient than this mechanism of trashing, copying, and 
         *      regenerating.
         */
        onUpdateObjects(objects) {
            this.wsObjects.splice(0, this.wsObjects.length);
            objects.forEach( o => this.addObject(o) );
        }

        /*
         * XXX: This is side-effecting!! We should have an 'addUser' event, not
         *      just an wams-update-user event, unless there's some very good reason 
         *      not to do so.
         */
        onUpdateUser(vsInfo) {
            if (vsInfo.id === this.id) {
                this.assign(vsInfo);
            } else {
                const user = this.otherUsers.find( v => v.id === vsInfo.id );
                if (user) user.assign(vsInfo);
                else this.addUser(vsInfo);
            }
        }

        onWindowLoad() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;

            /*
             * XXX: Are we sure we want to do this right away?
             */
            window.setInterval(this.draw.bind(this), globals.FRAMERATE);

            /*
             * XXX: Why do these listeners need to be attached all the way down 
             *      here instead of adjacent to the initialization of the 
             *      socket variable?
             */
            globals.SOCKET.on(globals.EVENT_INIT, this.onInit.bind(this));
            globals.SOCKET.on(globals.EVENT_UD_USER, this.onUpdateUser.bind(this));
            globals.SOCKET.on(globals.EVENT_RM_USER, this.onRemoveUser.bind(this));
            globals.SOCKET.on(globals.EVENT_UD_OBJS, this.onUpdateObjects.bind(this));
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

            const hammer = new Hammer(this.canvas);
            hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            hammer.get('pinch').set({ enable: true });
            [
                'tap',
                'dragstart',
                'drag',
                'dragend',
                'transformstart',
                'transform',
                'transformend',
            ].forEach( e => {
                hammer.on(e, (event) => event.preventDefault() );
                hammer.on(e, this[`on${e}`].bind(this));
            });
        }
    }

    return ClientViewSpace;
})();

class ClientWSObject extends WamsShared.WSObject {
    constructor(data) {
        super(data);
        if (data.hasOwnProperty('id')) {
            globals.OBJ_ID_STAMPER.stamp(this, data.id);
        }
        this.img = null;
        if (this.imgsrc) {
            this.img = new Image();
            this.img.src = this.imgsrc;
        }
    }

    draw() {
        const width = this.width || this.img.width;
        const height = this.height || this.img.height;

        if (this.imgsrc) {
            this.context.drawImage(this.img, this.x, this.y, width, height);
        } else {
            /*
             * XXX: Yikes!!! eval()? And we want this to be a usable 
             *      API? For people to work together over networks? 
             *      Pardon my French, but how the f*** are we going to 
             *      make sure that no one is injecting malicious code 
             *      here? 
             *
             *      Where is draw defined, and how does it end up here?
             *
             *      There must be a better way...
             */
            eval(`${this.draw};`);
            eval(`${this.drawStart};`);
        }
    }
}

// Entry point!
window.addEventListener(
    'load', 
    function run() {
        new ClientViewSpace().onWindowLoad();
    },
    {
        capture: false,
        once: true,
        passive: true,
    }
);


