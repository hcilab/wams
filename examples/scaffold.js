// Scaffold example for WAMS

// Includes the WAMS API
var WAMS = require("../WAMS/WAMS");

// Defines a Workspace that will listen on port 3000, takes in optional parameter
var my_workspace = new WAMS.WorkSpace(3000, {debug : false, BGcolor : "#aaaaaa"});

var handleLayout = function(ws, user){
    // Executed once every time a new user joins
}

var handleClick = function(target, user, x, y){
    // Executed every time a user taps or clicks a screen
}

var handleDrag = function(target, user, x, y, dx, dy){
    // Executed every time a drag occurs on a device 
}

var handleScale = function(user, newScale){
    // Executed when a user pinches a device, or uses the scroll wheel on a computer
}

// Attaches the defferent function handlers
my_workspace.attachClickHandler(handleClick);
my_workspace.attachScaleHandler(handleScale);
my_workspace.attachDragHandler(handleDrag);
my_workspace.attachLayoutHandler(handleLayout);