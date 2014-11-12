// What the person using the API would write

var WAMS = require("./WAMS");   // Includes the WAMS API

// Workspace_one has the giant monalisa background example
var workspace_one = new WAMS.WorkSpace(3000);    // Starts server listening on port 3000, takes in optional parameter settings = {debug: true/false, BGColor: "#000000-FFFFFF"}
    workspace_one.setBoundaries(4000, 4000);     // Set global boundaries for clients
    workspace_one.setClientLimit(4);             // Set Client Limit

// Creating and Adding Workspace objects. WSObject("Image.png", x, y, w, h)
var monaLisa = new WAMS.WSObject("monaLisa.png", 0, 0, workspace_one.getWidth(), workspace_one.getHeight());
    monaLisa.setType("mona");   // Set your custom Object type
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


// Workspace_two has the passing images example
var workspace_two = new WAMS.WorkSpace(3001);    // Starts server listening on port 3001, takes in optional parameter settings = {debug: true/false, BGColor: "#000000-FFFFFF"}
    workspace_two.setBoundaries(4000, 4000);     // Set global boundaries for clients
    workspace_two.setClientLimit(4);             // Set Client Limit

// Creating and Adding Workspace objects. WSObject("Image.png", x, y, w, h)
var monaLisa_2 = new WAMS.WSObject("monaLisa.png", 200, 200, 200, 200);
    monaLisa_2.setType("Draggable");  // Let's make a 'draggable' class/tag
workspace_two.addWSObject(monaLisa_2);

var scream = new WAMS.WSObject("scream.png", 400, 400, 200, 200);
    scream.setType("Draggable");    // Also want this one to be draggable
workspace_two.addWSObject(scream);

// Handle Drag, takes in the target that was dragged on and who caused the drag event
var handleDrag_two = function(target, client, x, y, dx, dy){
    if(target.type == "client/background"){
        // Do nothing because we don't want the client to be able to pan their viewspace around
        // client.move(dx, dy); // Will move the client around
    }
    else if(target.type == "Draggable"){
        target.move(-dx, -dy);  // If it's a draggable type move it, needs negative values because dx/dx are change from origin of drag
    }
}

// Example Layout function that takes in the newly added client and which workspace they joined
// Lays out users in a decending staircase pattern
var handleLayout_two = function(ws, client){
    var otherUsers = ws.getUsers();   // How you get the users of the project
    if(otherUsers.length == 0){ // First user don't move
        // Do Nothing
    }
    else{
        // Move the new client to the right of the last person to join
        client.moveToXY(otherUsers[otherUsers.length-1].right() - 10, otherUsers[otherUsers.length-1].top()); 
    }
}

workspace_two.attachDragHandler(handleDrag_two);
workspace_two.attachLayoutHandler(handleLayout_two);
