window.addEventListener('load', onWindowLoad, false);

function onWindowLoad() {
    main_ws = document.getElementById('main');
    main_ws.width = main_ws.getWidth();
    main_ws.height = main_ws.getHeight();

    ctx = main_ws.getContext('2d');
    mainViewSpace = new ViewSpace(0,0,main_ws.getWidth(), main_ws.getHeight(), 1, -1);
    ONE_FRAME_TIME = 1000 / 60 ;
    socket = io();

    setInterval(main_wsDraw, ONE_FRAME_TIME);
    HTMLCanvasElement.prototype.viewSpace = new ViewSpace(0,0,main_ws.getWidth(), main_ws.getHeight(), 1, -1);
    wsObjects = [];
    views = [];

    socket.on('init', onInit);
    socket.on('updateUser', onUpdateUser);
    socket.on('removeUser', onRemoveUser);
    socket.on('updateObjects', onUpdateObjects);

    images = [];
    settings = null;

    socket.on('message', function (message) {
        if(message === "user_disconnect"){
            alert("Sorry we're full right now!");
            document.body.innerHTML = "<H1>Application has reached capacity.</H1>";
        }
    });
}

function ViewSpace(x, y, w, h, scale, id){
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



function main_wsDraw(){
    // Clear old main_ws
    ctx.clearRect(0, 0, main_ws.getWidth(), main_ws.getHeight());
    ctx.save();
    ctx.scale(mainViewSpace.scale, mainViewSpace.scale);

    ctx.translate(-mainViewSpace.x, -mainViewSpace.y);
    ctx.rotate(mainViewSpace.rotation);


    switch(mainViewSpace.rotation){
        case(0): break;
        case(Math.PI): ctx.translate((-mainViewSpace.ew - mainViewSpace.x*2), (-mainViewSpace.eh - mainViewSpace.y*2)); break;
        case(Math.PI/2): ctx.translate(-mainViewSpace.ew, -mainViewSpace.x*2); break;
        case(3*Math.PI/2): ctx.translate(-mainViewSpace.y*2, -mainViewSpace.ew); break;
    }

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
                eval(wsObjects[i].draw+';');
                eval(wsObjects[i].startStart+';');
            }
        }

    }

    for (var i = 0; i < views.length; i++) {
        ctx.beginPath();
        ctx.rect(views[i].x, views[i].y, views[i].ew, views[i].eh);
        ctx.stroke();
    }

    ctx.restore();

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
    main_ws.width = window.innerWidth;
    main_ws.height = window.innerHeight;
    mainViewSpace.w = main_ws.getWidth();
    mainViewSpace.h = main_ws.getHeight();
    mainViewSpace.ew = mainViewSpace.w/mainViewSpace.scale;
    mainViewSpace.eh = mainViewSpace.h/mainViewSpace.scale;
    mainViewSpace.reportView();

}

window.addEventListener("mousewheel", onMouseScroll, false);
window.addEventListener("DOMMouseScroll", onMouseScroll, false);

function onMouseScroll(ev) {
    var delta = Math.max(-1, Math.min(1, (ev.wheelDelta || -ev.detail)));
    var newScale = mainViewSpace.scale + delta*0.09;
    socket.emit('handleScale', mainViewSpace, newScale);
}

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

var transforming = false;
touchEventHandler.on('tap dragstart drag dragend transformstart transform transformend', function(ev){
    ev.preventDefault();
    ev.gesture.preventDefault();
    switch(ev.type){
        case('tap') :
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
    if(settings.BGcolor != null){
        document.getElementById('main').style.backgroundColor = settings.BGcolor;
    }
    else{
        document.getElementById('main').style.backgroundColor = "#aaaaaa";
    }
    mainViewSpace.id = initData.id;
    for (var i = 0; i < initData.views.length; i++) {
        if(initData.views[i].id != mainViewSpace.id){
            views.push(new ViewSpace(initData.views[i].x, initData.views[i].y, initData.views[i].w, initData.views[i].h, initData.views[i].scale, initData.views[i].id));
        }
    }
    for (var i = 0; i < initData.wsObjects.length; i++) {
        wsObjects.push(initData.wsObjects[i]);
        
        if (wsObjects[i].imgsrc){
            images[initData.wsObjects[i].id] = new Image();
            images[initData.wsObjects[i].id].src = initData.wsObjects[i].imgsrc;
        }
    }

    mainViewSpace.reportView(true);
}


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

