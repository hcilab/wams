var WAMS = require("../WAMS/WAMS");

var main_ws = new WAMS.WorkSpace(9001, {debug : false, BGcolor: "green"});
main_ws.setBoundaries(10000, 10000);
main_ws.setClientLimit(5);  // 4 players plus one for the table

var second_ws = new WAMS.WorkSpace(9501, {debug : false, BGcolor: "blue"});
second_ws.setBoundaries(1000, 1000);
second_ws.setClientLimit(5);  // 4 players plus one for the table

// Creating and Adding Workspace objects. (image, x, y, w, h)
var opts = {'imgsrc':'joker.png'};
var joker = new WAMS.WSObject(main_ws.getCenter().x, main_ws.getCenter().y, 200, 282, "joker",opts);

main_ws.addWSObject(joker);
main_ws.addSubWS(second_ws);

var draw = `function drawFunc()
{
    ctx.beginPath();
    ctx.arc(${main_ws.getCenter().x},${main_ws.getCenter().y + 100},100,2*Math.PI,false);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
    ctx.font      = "normal 36px Verdana";
    ctx.fillStyle = "#000000";
    ctx.fillText("HTML5 Canvas Text", ${main_ws.getCenter().x +100}, ${main_ws.getCenter().y + 100});
};`;

//console.log(draw.toString());
opts = {'draw':draw.toString(),'drawStart': 'drawFunc()'};

var drawing = new WAMS.WSObject(main_ws.getCenter().x, main_ws.getCenter().y, 500, 100,"text",opts);
main_ws.addWSObject(drawing);

//global for keeping track of the view acting as table
var table = null;

var handleLayout = function(ws, view){
    var otherUsers = ws.users;

    switch(otherUsers.length){  // Positions are based on how many other users there are
        case(0): // First view will be the table
            view.moveToXY(ws.getCenter().x, ws.getCenter().y);
            table = view;
            break;
        case(1): // Second person is put under the table, no rotation
            view.moveToXY(table.left(), table.bottom());
            break;
        case(2):
            view.rotation = Math.PI;
            view.moveToXY(table.left(), (table.top() - view.eh));
            break;
        case(3):
            view.rotation = 3*Math.PI/2;
            view.moveToXY((table.left() - view.ew), table.top());
            break;
        case(4):
            view.rotation = Math.PI/2;
            view.moveToXY(table.right(), table.top());
            break;
    }
}

var handleDrag = function(target, view, x, y, dx, dy){
    console.log(target);

    if(target.type == "view/background"){
        // Do nothing because we don't want the views to be able to pan their viewspace around
        view.move(dx, dy); // Will move the view around
    }
    else if(target.type == "joker" || target.type == "text"){
        target.move(-dx, -dy);  // If it's a draggable type move it, needs negative values because dx/dx are change from origin of drag
    }
}

var handleScale = function(view, newScale){
    view.rescale(newScale);
}

var faceUp = true;
var handleClick = function(target, view, x, y){
    console.log(target);
    if(target.type == "joker"){
        if(faceUp){
            faceUp = false;
            target.setImgSrc("card-back.png");
        }
        else{
            faceUp = true;
            target.setImgSrc("joker.png");
        }
    }
}

main_ws.attachClickHandler(handleClick);
main_ws.attachScaleHandler(handleScale);
main_ws.attachDragHandler(handleDrag);
main_ws.attachLayoutHandler(handleLayout);
