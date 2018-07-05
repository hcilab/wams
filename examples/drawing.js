// Scaffold example for WAMS

// Includes the WAMS API
var WAMS = require("../WAMS/WAMS");

// Defines a Workspace that will listen on port 3000, takes in optional parameter
var my_workspace = new WAMS.WorkSpace(9002, {debug : false, BGcolor : "#aaaaaa"});
var newSquare = new WAMS.WSObject(32, 32, 128, 128,'color', {'imgsrc':'red.png'});
    newSquare.setType("color");
my_workspace.addWSObject(newSquare);

var handleLayout = function(ws, user){
    // Executed once every time a new user joins
    var otherUsers = ws.users;
    if(otherUsers.length > 1){
        user.moveToXY(ws.getCenter().x, ws.getCenter().y);
    }
}

var handleClick = function(target, user, x, y){
    // Executed every time a user taps or clicks a screen
    console.log("clicked in handle click: "+target.type);
    var ws = my_workspace;
    if(target.type == "color"){
        ws.removeWSObject(target);
    }
    else{
        switch(user.id % 6){
            case(0) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color", {'imgsrc': "blue.png"})); break;
            case(1) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color", {'imgsrc':"red.png"})); break;
            case(2) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color", {'imgsrc':"green.png"})); break;
            case(3) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color", {'imgsrc':"pink.png"})); break;
            case(4) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color",{'imgsrc':"cyan.png"}));break;
            case(5) : ws.addWSObject(new WAMS.WSObject(x-64, y-64, 128, 128, "color",{'imgsrc': "yellow.png"})); break;
        }
    }
}

var handleDrag = function(target, user, x, y, dx, dy){
    // Executed every time a drag occurs on a device
    if(target.type == "color"){
        target.move(-dx, -dy);
    }
    else if(target.type == "client/background"){
        target.move(dx, dy);
    }
    
}

var handleScale = function(user, newScale){
    // Executed when a user pinches a device, or uses the scroll wheel on a computer
    user.rescale(newScale);
}

// Attaches the defferent function handlers
my_workspace.attachClickHandler(handleClick);
my_workspace.attachScaleHandler(handleScale);
my_workspace.attachDragHandler(handleDrag);
my_workspace.attachLayoutHandler(handleLayout);
