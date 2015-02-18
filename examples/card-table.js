var WAMS = require("../WAMS/WAMS");

var main_ws = new WAMS.WorkSpace(3000, {debug : false, BGcolor: "green"});
    main_ws.setBoundaries(10000, 10000);
    main_ws.setClientLimit(5);  // 4 players plus one for the table

// Creating and Adding Workspace objects. (image, x, y, w, h)
var joker = new WAMS.WSObject("joker.png", main_ws.getCenter().x, main_ws.getCenter().y, 200, 282);
    joker.setType("joker");   // Set your custom Object type

main_ws.addWSObject(joker);

var table = null;
var handleLayout = function(ws, client){
    var otherUsers = ws.getUsers();
    switch(otherUsers.length){  // Positions are based on how many other users there are
        case(0): // First person will be the table
            client.moveToXY(ws.getCenter().x, ws.getCenter().y);
            table = client;
            break;
        case(1): // Second person is put under the table, no rotation
            client.moveToXY(table.left(), table.bottom());
            break;
        case(2):
            client.rotation = Math.PI;
            client.moveToXY(table.left(), (table.top() - client.eh));
            break;
        case(3):
            client.rotation = 3*Math.PI/2;
            client.moveToXY((table.left() - client.ew), table.top());
            break;
        case(4):
            client.rotation = Math.PI/2;
            client.moveToXY(table.right(), table.top());
            break;
    }
}

var handleDrag = function(target, client, x, y, dx, dy){
    if(target.type == "client/background"){
        // Do nothing because we don't want the clients to be able to pan their viewspace around
        // client.move(dx, dy); // Will move the client around
    }
    else if(target.type == "joker"){
        target.move(-dx, -dy);  // If it's a draggable type move it, needs negative values because dx/dx are change from origin of drag
    }
}

var handleScale = function(client, newScale){
    client.rescale(newScale);
}

var faceUp = true;
var handleClick = function(target, client, x, y){
    if(target.type == "joker"){
        if(faceUp){
            faceUp = false;
            target.setImage("card-back.png");
        }
        else{
            faceUp = true;
            target.setImage("joker.png");
        }
    }
}

main_ws.attachClickHandler(handleClick);
main_ws.attachScaleHandler(handleScale);
main_ws.attachDragHandler(handleDrag);
main_ws.attachLayoutHandler(handleLayout);