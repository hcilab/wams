var WAMS = require("../WAMS/WAMS");   // Includes the WAMS API

var workspace_one = new WAMS.WorkSpace(9000);    // Starts server listening on port 3000, takes in optional parameter settings = {debug: true/false, BGColor: "#000000-FFFFFF"}
    workspace_one.setBoundaries(4000, 4000);     // Set global boundaries for clients
    workspace_one.setClientLimit(4);             // Set Client Limit

// Creating and Adding Workspace objects. WSObject("Image.png", x, y, w, h)
//var monaLisa = new WAMS.WSObject("monaLisa.png", 0, 0, workspace_one.getWidth(), workspace_one.getHeight());
//    monaLisa.setType("mona");   // Set your custom Object type
var monaLisa = new WAMS.WSObject(0,0,workspace_one.getWidth(),workspace_one.getHeight(),"mona", {"imgsrc":"monaLisa.png"});
workspace_one.addWSObject(monaLisa);

// Handle Drag, takes in the target that was dragged on and who caused the drag event
var handleDrag = function(target, client, x, y, dx, dy){
    if(target.type == "client/background"){ // "client/background" is the type if your drag isen't on any objects
        target.move(dx, dy);
    }
    else if(target.type == "mona"){ // We can check if target was our custom type, still just want to move the client anyway
        client.move(dx, dy);
    }
}

// Example Layout function that takes in the newly added client and which workspace they joined
// Lays out users in a decending staircase pattern
var handleLayout = function(ws, client){
    var otherUsers = ws.getUsers();   // How you get the users of the project
    
    if(otherUsers.length == 0){ // First user don't move
        // Do Nothing
    }
    else{
        if(otherUsers.length % 2 == 0){ // Decide where to put the user based on parity of the number of other users            
            client.moveToXY(otherUsers[otherUsers.length-1].right() - 10, otherUsers[otherUsers.length-1].top());
        }
        else{
            client.moveToXY(otherUsers[otherUsers.length-1].left(), otherUsers[otherUsers.length-1].bottom() - 10);
        }    
    }
}

// Handle Scale, uses the built in viewspace method rescale
var handleScale = function(vs, newScale){
    vs.rescale(newScale);
}

workspace_one.attachDragHandler(handleDrag);
workspace_one.attachLayoutHandler(handleLayout);
workspace_one.attachScaleHandler(handleScale);
