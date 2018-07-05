window.addEventListener('load', onWindowLoad, false);

function onWindowLoad() {
    /*
     * XXX: Where are these variables being defined???
     *      Please don't tell me that hammer.js uses a bunch of globals for the 
     *      user to configure...
     *
     *      + Answer: Doesn't appear to be that way, looks like we're the ones 
     *          defining globals (accidentally / intentionally?). This should 
     *          probably be refactored, because this is a pretty gross, and 
     *          will not be accepted by JavaScript's strict mode, which we 
     *          should and will be using.
     */
    main_ws = document.getElementById('main');

    /*
     * XXX: Wait... what??? Something seems broken here...
     */
    main_ws.width = main_ws.getWidth();
    main_ws.height = main_ws.getHeight();

    /*
     * XXX: We seem to be mixing our code together here in an unorganized way,
     *      I'm not entirely comfortable with this.
     */
    ctx = main_ws.getContext('2d');
    mainViewSpace = new ViewSpace(0,0,main_ws.getWidth(), main_ws.getHeight(), 1, -1);
    ONE_FRAME_TIME = 1000 / 60 ;
    socket = io();

    /*
     * XXX: Are we sure we want to do this right away?
     */
    setInterval(main_wsDraw, ONE_FRAME_TIME);

    /*
     * XXX: Whoa whoa whoa what is going on here??? Is this why there are 
     *      functions added to the HTMLCanvasElement in the utils file? Is this
     *      really necessary? This seems risky, especially since we could just
     *      do things the other way around, and have our client-side ViewSpace
     *      extend the HTMLCanvasElement. At least I'm pretty sure we could...
     *
     *      Also I know that this file and the WAMS.js file will be used in 
     *      entirely different contexts, but this still makes me incredibly
     *      uncomfortable that they both use an identically named but different
     *      ViewSpace class.
     *
     *      This makes me really want to write a ViewSpace.js file which the
     *      WAMS.js file will 'require()' and which can be included as a script
     *      in the view, which will include a parent class which the two 
     *      current ViewSpace classes can extend.
     *
     *      ...
     *
     *      Okay timeout. This value is never used!!!
     *
     *      I'll just delete this.
     */
    HTMLCanvasElement.prototype.viewSpace = new ViewSpace(0,0,main_ws.getWidth(), main_ws.getHeight(), 1, -1);
    wsObjects = [];
    views = [];

    /*
     * XXX: Why do these listeners need to be attached all the way down here
     *      instead of adjacent to the initialization of the socket variable?
     */
    socket.on('init', onInit);
    socket.on('updateUser', onUpdateUser);
    socket.on('removeUser', onRemoveUser);
    socket.on('updateObjects', onUpdateObjects);

    /*
     * XXX: Organize this...
     */
    images = [];
    settings = null;

    socket.on('message', function (message) {
        if(message === "user_disconnect"){
            alert("Sorry we're full right now!");
            document.body.innerHTML = "<H1>Application has reached capacity.</H1>";
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
function ViewSpace(x, y, w, h, scale, id){
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


ViewSpace.prototype.reportView = function(reportSubWS){
    var vsInfo = {
        x : this.x,
        y : this.y,
        w : this.w,
        h : this.h,
        ew : this.ew,
        eh : this.eh,
        scale : this.scale,
        id : this.id
    };

    /*
     * XXX: Do we want to connect the subviews in this view somehow, so that
     *      they are clearly linked in the report?
     */
    if (reportSubWS)
    {
        this.subViews.forEach(
            function(subWS,index){
                subWS.reportView(true);
            }
        );
    }

    socket.emit('reportView', vsInfo);
}

/*
 * XXX: Okay, I'll need to dig into the canvas API if I'm going to understand
 *      this.
 */
function main_wsDraw(){
    // Clear old main_ws
    ctx.clearRect(0, 0, main_ws.getWidth(), main_ws.getHeight());
    ctx.save();
    ctx.scale(mainViewSpace.scale, mainViewSpace.scale);

    ctx.translate(-mainViewSpace.x, -mainViewSpace.y);
    ctx.rotate(mainViewSpace.rotation);

    /*
     * XXX: I think maybe this should be a 'rotate' function.
     */
    switch(mainViewSpace.rotation){
        case(0): break;
        case(Math.PI): ctx.translate((-mainViewSpace.ew - mainViewSpace.x*2), (-mainViewSpace.eh - mainViewSpace.y*2)); break;
        case(Math.PI/2): ctx.translate(-mainViewSpace.ew, -mainViewSpace.x*2); break;
        case(3*Math.PI/2): ctx.translate(-mainViewSpace.y*2, -mainViewSpace.ew); break;
    }

    /*
     * XXX: Each WSObject should have a draw() function defined on it, which
     *      can then be called from inside a simple forEach().
     */
    for (var i = 0; i < wsObjects.length; i++) {
        //console.log(wsObjects);
        if (wsObjects[i].w != null && wsObjects[i].h != null){
            if (wsObjects[i].imgsrc)
            {
                ctx.drawImage(images[wsObjects[i].id], wsObjects[i].x, wsObjects[i].y, wsObjects[i].w, wsObjects[i].h);
            }
            else
            {   
            //console.log(wsObjects[i].draw);
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
                eval(wsObjects[i].draw+';');
                eval(wsObjects[i].drawStart+';');
            }
        }
        else{
            if (wsObjects[i].imgsrc)
            {
                ctx.drawImage(images[wsObjects[i].id], wsObjects[i].x, wsObjects[i].y);
            }

            else
            {
                /*
                 * XXX: Same eval() complaint as above, but with the added
                 *      complaint that this is duplicated code.
                 */
                eval(wsObjects[i].draw+';');
                eval(wsObjects[i].startStart+';');
            }
        }

    }

    /*
     * XXX: What exactly is going on here? Is this where we draw the rectangles
     *      showing users where the other users are looking?
     */
    for (var i = 0; i < views.length; i++) {
        ctx.beginPath();
        ctx.rect(views[i].x, views[i].y, views[i].ew, views[i].eh);
        ctx.stroke();
    }

    ctx.restore();

    /*
     * XXX: This should be a function.
     */
    if(settings != null && settings.debug){
        ctx.font = "18px Georgia";
        ctx.fillText("Mouse Coordinates: " + mouse.x.toFixed(2) + ", " + mouse.y.toFixed(2), 10, 20);
        ctx.fillText("ViewSpace Coordinates: " + mainViewSpace.x.toFixed(2) + ", " + mainViewSpace.y.toFixed(2), 10, 40);
        ctx.fillText("Bottom Right Corner: " + (mainViewSpace.x + mainViewSpace.w).toFixed(2) + ", " + (mainViewSpace.y + mainViewSpace.h).toFixed(2), 10, 60);
        ctx.fillText("Number of Other Users: " + views.length, 10, 80);
        ctx.fillText("Viewspace Scale: " + mainViewSpace.scale.toFixed(2), 10, 100);
        ctx.fillText("ViewSpace Rotation: " + mainViewSpace.rotation, 10, 120);
    }
}

window.addEventListener('resize', onResized, false);
function onResized(){
    /*
     * XXX: See here this at least sort of makes sense, yet earlier there was
     *      some kind of main_ws.width = main_ws.getWidth() nonsense.
     */
    main_ws.width = window.innerWidth;
    main_ws.height = window.innerHeight;

    /*
     * XXX: main_ws is a <canvas>
     *      mainViewSpace is a client-side ViewSpace
     *
     *      Can we clarify this? This really confused me. Is there a reason we
     *      need both?
     */
    mainViewSpace.w = main_ws.getWidth();
    mainViewSpace.h = main_ws.getHeight();
    mainViewSpace.ew = mainViewSpace.w/mainViewSpace.scale;
    mainViewSpace.eh = mainViewSpace.h/mainViewSpace.scale;
    mainViewSpace.reportView();

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
    var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
    var newScale = mainViewSpace.scale + delta*0.09;
    socket.emit('handleScale', mainViewSpace, newScale);
}

/*
 * XXX: More globals, yet for some reason they've been (more) correctly defined
 *      as such this time around, instead of just crossing our fingers and
 *      hoping the JS fairies hoist our variables to the global scope...
 *      (That's a good thing, but this code still needs to be organized).
 */
var mouse = {x: 0, y: 0};
var lastMouse = {x: 0, y: 0};
var temp = 0;

var hammerOptions = {
    dragLockToAxis : true,
    dragBlockHorizontal : true,
    preventDefault : true,
    transform_always_block: true,
    transform_min_scale: 1,
    drag_block_horizontal: true,
    drag_block_vertical: true,
    drag_min_distance: 0
};

var touchEventHandler = Hammer(document.body, hammerOptions);

/*
 * XXX: I'm not sure I like this approach of attaching the same listener to all
 *      of the events, then 'switch'ing between the events based on type...
 */
var transforming = false;
touchEventHandler.on('tap dragstart drag dragend transformstart transform transformend', function(ev){
    ev.preventDefault();
    ev.gesture.preventDefault();
    switch(ev.type){
        case('tap') :
            mouse.x = ev.gesture.center.pageX/mainViewSpace.scale + mainViewSpace.x;
            mouse.y = ev.gesture.center.pageY/mainViewSpace.scale + mainViewSpace.y;
            /*
             * XXX: Is this code just copy-pasted across three of the cases???
             */
            switch(mainViewSpace.rotation){
                case(0): break;
                case(Math.PI): 
                    mouse.x = mainViewSpace.x + (mainViewSpace.ew * (1 - ((mouse.x - mainViewSpace.x)/mainViewSpace.ew))); 
                    mouse.y = mainViewSpace.y + (mainViewSpace.eh * (1 - ((mouse.y - mainViewSpace.y)/mainViewSpace.eh))); 
                    break;
                case(Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) + (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) - (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
                case(3*Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) - (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) + (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
            }
            socket.emit('handleClick', mouse.x, mouse.y);
        case 'dragstart':
            mouse.x = ev.gesture.center.pageX/mainViewSpace.scale + mainViewSpace.x;
            mouse.y = ev.gesture.center.pageY/mainViewSpace.scale + mainViewSpace.y;
            switch(mainViewSpace.rotation){
                case(0): break;
                case(Math.PI): 
                    mouse.x = mainViewSpace.x + (mainViewSpace.ew * (1 - ((mouse.x - mainViewSpace.x)/mainViewSpace.ew))); 
                    mouse.y = mainViewSpace.y + (mainViewSpace.eh * (1 - ((mouse.y - mainViewSpace.y)/mainViewSpace.eh)));
                    break;
                case(Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) + (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) - (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
                case(3*Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) - (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) + (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
            }
            break;
        case 'drag':
            /*
             * XXX: Where is transforming defined, where does it get modified?
             *
             *      + Answer: Defined before this listener attachment, modified
             *          about 30 lines down in the transformstart and 
             *          transformend cases.
             */
            if(transforming){
                return;
            }
            lastMouse.x = mouse.x;
            lastMouse.y = mouse.y;
            mouse.x = ev.gesture.center.pageX/mainViewSpace.scale + mainViewSpace.x;
            mouse.y = ev.gesture.center.pageY/mainViewSpace.scale + mainViewSpace.y;
            switch(mainViewSpace.rotation){
                case(0): break;
                case(Math.PI): 
                    mouse.x = mainViewSpace.x + (mainViewSpace.ew * (1 - ((mouse.x - mainViewSpace.x)/mainViewSpace.ew))); 
                    mouse.y = mainViewSpace.y + (mainViewSpace.eh * (1 - ((mouse.y - mainViewSpace.y)/mainViewSpace.eh)));
                    break;
                case(Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) + (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) - (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
                case(3*Math.PI/2): 
                    temp = mouse.x;
                    mouse.x = (mainViewSpace.x + mainViewSpace.ew/2) - (mouse.y - (mainViewSpace.y + mainViewSpace.eh/2)); 
                    mouse.y = (mainViewSpace.y + mainViewSpace.eh/2) + (temp - (mainViewSpace.x + mainViewSpace.ew/2));
                    break;
            }
            socket.emit('handleDrag', mainViewSpace, mouse.x, mouse.y, (lastMouse.x - mouse.x), (lastMouse.y - mouse.y));
            break;
        case 'dragend':
            /*
             * XXX: Why listen at all? Is it just to prevent default?
             */
            break;
        case 'transformstart':
            transforming = true;
            startScale = mainViewSpace.scale;
            break;
        case 'transform':
            var scale = ev.gesture.scale;
            var newScale = scale * startScale;
            socket.emit('handleScale', mainViewSpace, newScale);
            break;
        case 'transformend':
            transforming = false;
            startScale = null;
            break;


    }
});

function onInit(initData){
    settings = initData.settings;
    /*
     * XXX: Clean this up.
     */
    if(settings.BGcolor != null){
        document.getElementById('main').style.backgroundColor = settings.BGcolor;
    }
    else{
        document.getElementById('main').style.backgroundColor = "#aaaaaa";
    }

    /*
     * XXX: Look everywhere and make sure that mainViewSpace.id isn't getting
     *      set anywhere else!
     *
     *      Should make sure that all IDs anywhere are immutable once assigned.
     *      Perhaps an 'assignID' function? It could take an object to assign
     *      and an ID generator (preferably also immutable).
     */
    mainViewSpace.id = initData.id;
    for (var i = 0; i < initData.views.length; i++) {
        /*
         * XXX: I'm not exactly sure what's going on here. Are we pushing in
         *      subviews? What are the initData.views? Why are we generating
         *      new ViewSpaces instead of pushing in the ViewSpace from
         *      initData?
         */
        if(initData.views[i].id != mainViewSpace.id){
            views.push(new ViewSpace(initData.views[i].x, initData.views[i].y, initData.views[i].w, initData.views[i].h, initData.views[i].scale, initData.views[i].id));
        }
    }

    /*
     * XXX: What kind of Image() is this? Where is it defined?
     */
    for (var i = 0; i < initData.wsObjects.length; i++) {
        wsObjects.push(initData.wsObjects[i]);
        
        if (wsObjects[i].imgsrc){
            images[initData.wsObjects[i].id] = new Image();
            images[initData.wsObjects[i].id].src = initData.wsObjects[i].imgsrc;
        }
    }

    mainViewSpace.reportView(true);
}

/*
 * XXX: Unless used elsewhere, this global variable should almost certainly be
 *      tucked into the listener.
 *
 *      + Answer: A quick grep reveals that no, it is not used elsewhere. Put
 *          it inside the listener.
 */
var noUserFound = true;
function onUpdateUser(vsInfo){
    // socket.emit('consoleLog', "User: " + mainViewSpace.id + " updating " + vsInfo.id + "'s info.");
    if(vsInfo.id == mainViewSpace.id){
        mainViewSpace.x = vsInfo.x;
        mainViewSpace.y = vsInfo.y;
        mainViewSpace.w = vsInfo.w;
        mainViewSpace.h = vsInfo.h;
        mainViewSpace.ew = vsInfo.ew;
        mainViewSpace.eh = vsInfo.eh;
        mainViewSpace.scale = vsInfo.scale;
        mainViewSpace.rotation = vsInfo.rotation;
    }
    else{
        for (var i = 0; i < views.length; i++) {
            if(views[i].id == vsInfo.id){
                noUserFound = false;
                views[i].x = vsInfo.x;
                views[i].y = vsInfo.y;
                views[i].w = vsInfo.w;
                views[i].h = vsInfo.h;
                views[i].ew = vsInfo.ew;
                views[i].eh = vsInfo.eh;
                views[i].scale = vsInfo.scale;
                views[i].id = vsInfo.id;
                break;
            }
        }
        if(noUserFound){
            views.push(new ViewSpace(vsInfo.x, vsInfo.y, vsInfo.w, vsInfo.h, vsInfo.scale, vsInfo.id));
        }
        noUserFound = true;
    }
}

function onRemoveUser(id){
    for (var i = 0; i < views.length; i++) {
        if(views[i].id == id){
            views.remove(i);
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
function onUpdateObjects(objects){
    wsObjects = [];
    for (var i = 0; i < objects.length; i++) {
        wsObjects.push(objects[i]);

        if (wsObjects[i].imgsrc){
            images[objects[i].id] = new Image();
            images[objects[i].id].src = objects[i].imgsrc;
        }
    }
}

