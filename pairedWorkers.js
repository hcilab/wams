var WAMS = require("./WAMS");   // Includes the WAMS API

var workspace_one = new WAMS.WorkSpace(3000, {debug : false, BGcolor : "#aaaaaa"});

var monaLisa = new WAMS.WSObject("monaLisa.png", 200, 200, 200, 200);
    monaLisa.setType("Draggable");

var scream = new WAMS.WSObject("scream.png", 400, 400, 200, 200);
    scream.setType("Draggable");
    
workspace_one.addWSObject(monaLisa);
workspace_one.addWSObject(scream);

var handleDrag = function(target, client, x, y, dx, dy){
    if(target.type == "Draggable"){
        target.move(-dx, -dy);
    }
}

var handleLayout = function(ws, client){
    var otherUsers = ws.getUsers();
    if(otherUsers.length != 0){
        client.moveToXY(otherUsers[otherUsers.length-1].right() - 30, otherUsers[otherUsers.length-1].top()); 
    }
}

workspace_one.attachDragHandler(handleDrag);
workspace_one.attachLayoutHandler(handleLayout);