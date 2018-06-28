//TODO: Update canvas to work more like this for drawings: https://simonsarris.com/making-html5-canvas-useful/
//TODO: Stretch goal is to incorporate a canvas library: http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/
//TODO: Allow subcanvas to be drawn on top: https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers
// WAMS - An API for Multi-Surface Environments
var express = require('express');
var http = require('http');
var io = require('socket.io');
var path = require('path')

//globals for keeping track of IDs
var WSID = 0;   //workspace ID
var WSOBID = 0; //workspace Object ID
var CLIENTID = 1;

//set to false to limit console logging
var WDEBUG = true;

function WorkSpace(port, settings){
    this.app = express();
    this.http = http.createServer(this.app);
    this.io = io.listen(this.http);
    this.id = WSID++;
    this.viewID = 1;

    this.app.get('/', function(req, res){
        res.sendFile(path.resolve('../WAMS/view.html'));
    });
    this.app.get('/WAMS-util.js', function(req, res){
        res.sendFile(path.resolve('../WAMS/WAMS-util.js'));
    });
    this.app.get('/WAMS-view.js', function(req, res){
        res.sendFile(path.resolve('../WAMS/WAMS-view.js'));
    });

    this.app.use(express.static(path.resolve('./Images')));
    this.app.use(express.static(path.resolve('../libs')));

    this.views = [];
    this.wsObjects = [];
    this.subWS = [];
    
    this.boundaries = {
        x : 10000,
        y : 10000
    };

    this.MAX_USERS = 10;
    this.id = port;

    this.settings = settings || this.defaultSettings();

    var self = this;
    this.io.on('connection', function(socket){
        
        var viewSpace = new ViewSpace(self.viewID++);
        viewSpace.boundaries = self.boundaries;
        
        if (WDEBUG) console.log('User ' + viewSpace.id + ' connected to workspace ' + self.id);
        var initData = {
            views : self.views,
            wsObjects : self.wsObjects,
            settings : self.settings,
            id : viewSpace.id
        };

        socket.emit('init', initData);
        
        var initializedLayout = false;
        
        socket.on('reportView', function(vsInfo){
            if(self.views.length < self.MAX_USERS){
                if(viewSpace.id == vsInfo.id){
                    viewSpace.x = vsInfo.x;
                    viewSpace.y = vsInfo.y;
                    viewSpace.w = vsInfo.w;
                    viewSpace.h = vsInfo.h;
                    viewSpace.ew = vsInfo.ew;
                    viewSpace.eh = vsInfo.eh;
                    viewSpace.scale = vsInfo.scale;
                    viewSpace.id = vsInfo.id;
                    viewSpace.views = [];
                }
                if(!initializedLayout){
                    initializedLayout = true;
                    if(self.layoutHandler != null){
                        self.layoutHandler(self, viewSpace);
                    }
                    else{
                        console.log("Layout handler is not attached!");
                    }
                    self.views.push(viewSpace);
                }
                socket.emit('updateUser', viewSpace);
                socket.broadcast.emit('updateUser', viewSpace);
            }
            else if(!initializedLayout){
                self.views.push(viewSpace);
                socket.send("user_disconnect");

                for (var i = 0; i < views.length; i++) {
                    if(self.views[i].id == viewSpace.id){
                        self.views.remove(i);
                        break;
                    }
                }
            }
        });

        socket.on('handleDrag', function(vs, x, y, dx, dy){
            if(vs.id == viewSpace.id){
                if(self.dragHandler != null){
                    for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                        if((self.wsObjects[i].x < x) && (self.wsObjects[i].x  + self.wsObjects[i].w > x) && (self.wsObjects[i].y < y) && (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                            self.dragHandler(self.wsObjects[i], viewSpace, x, y, dx, dy);
                            socket.emit('updateUser', viewSpace);
                            socket.broadcast.emit('updateUser', viewSpace);
                            socket.emit('updateObjects', self.wsObjects);
                            socket.broadcast.emit('updateObjects', self.wsObjects);
                            break;
                        }
                        else if(i == 0){
                            self.dragHandler(viewSpace, viewSpace, x, y, dx, dy);
                            socket.emit('updateUser', viewSpace);
                            socket.broadcast.emit('updateUser', viewSpace);
                        }  
                    }
                }
                else{
                    console.log("Drag handler is not attached for "+vs.id);
                }
            }
        });

        socket.on('handleClick', function(x, y){
            if(self.clickHandler != null){
                if (WDEBUG) console.log(self.wsObjects.length);
                foundObject = false;
                for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                    if (WDEBUG) console.log("clicked: "+self.wsObjects[i]);

                    if((self.wsObjects[i].x < x) && (self.wsObjects[i].x  + self.wsObjects[i].w > x) && 
                       (self.wsObjects[i].y < y) && (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                        self.clickHandler(self.wsObjects[i],viewSpace, x, y);
                        socket.emit('updateUser', viewSpace);
                        socket.broadcast.emit('updateUser', viewSpace);
                        socket.emit('updateObjects', self.wsObjects);
                        socket.broadcast.emit('updateObjects', self.wsObjects);
                        foundObject = true;
                        break;
                    }
                }
                if(!foundObject){
                    self.clickHandler(self, viewSpace, x, y);
                    socket.emit('updateUser', viewSpace);
                    socket.broadcast.emit('updateUser', viewSpace);
                    socket.emit('updateObjects', self.wsObjects);
                    socket.broadcast.emit('updateObjects', self.wsObjects);
                    if (WDEBUG) console.log("not found");
                }
                else if (WDEBUG) console.log("found");
            }
            else{
                console.log("Click Handler is not attached!");
            }
        });

        socket.on('handleScale', function(vs, newScale){
            if(vs.id == viewSpace.id){
                if(self.scaleHandler != null){
                    self.scaleHandler(viewSpace, newScale);
                    socket.emit('updateUser', viewSpace);
                    socket.broadcast.emit('updateUser', viewSpace);
                }
                else{
                    console.log("Scale handler is not attached!");
                }
            }
        });

        socket.on('consoleLog', function(toBeLogged){
            if (WDEBUG) console.log(toBeLogged);
        });

        socket.on('disconnect', function(){
            console.log('user ' + viewSpace.id + ' disconnected from workspace ' + self.id);
            socket.broadcast.emit('removeUser', viewSpace.id);
            for (var i = 0; i < self.views.length; i++) {
                if(self.views[i].id == viewSpace.id){
                    self.views.remove(i);
                    break;
                }
            }
        });
    });

    this.http.listen(port, function(){
        var ip = require('ip');
        console.log('listening on ' + ip.address() + ':' + port);
    });
}

WorkSpace.prototype.attachDragHandler = function(func){
    this.dragHandler = func;
}

WorkSpace.prototype.attachLayoutHandler = function(func){
    this.layoutHandler = func;
}

WorkSpace.prototype.attachClickHandler = function(func){
    this.clickHandler = func;
}

WorkSpace.prototype.attachScaleHandler = function(func){
    this.scaleHandler = func;
}


WorkSpace.prototype.addWSObject = function(obj){
    obj.id = WSOBID++;
    this.wsObjects.push(obj);
    if (WDEBUG) console.log("adding object: "+obj.id+" ("+obj.type+")");
}

WorkSpace.prototype.removeWSObject = function(obj){
    for (var i = this.wsObjects.length - 1; i >= 0; i--) {
        if(this.wsObjects[i].id == obj.id){
            this.wsObjects.remove(i);
            if (WDEBUG) console.log("removing object: "+obj.id+" ("+obj.type+")");
            break;
        }
    }
}

WorkSpace.prototype.getUsers = function(){
    return this.views;
}

WorkSpace.prototype.setBoundaries = function(maxX, maxY){
    this.boundaries.x = maxX;
    this.boundaries.y = maxY;
}

WorkSpace.prototype.getWidth = function(){
    return this.boundaries.x;
}

WorkSpace.prototype.getHeight = function(){
    return this.boundaries.y;
}

WorkSpace.prototype.getCenter = function(){
    return {
        x : this.boundaries.x/2,
        y : this.boundaries.y/2
    };
}

WorkSpace.prototype.setClientLimit = function(maxUsers){
    this.MAX_USERS = maxUsers;
}

WorkSpace.prototype.defaultSettings = function(){
    var defaults = {
        debug : false,
        BGcolor : "#aaaaaa"
    };
    return defaults;
}

WorkSpace.prototype.addSubWS = function(subWS) {
    this.subWS.push(subWS);
    //TODO: add check to make sure subWS is in bounds of the main workspace
    //TODO: probably send a workspace update message
}

function WSObject(x, y, w, h, type, opts){
    if (opts)
    {
        if (opts.imgsrc)
        {
            this.imgsrc = opts.imgsrc;
        }

        else
        {
            this.draw = opts.draw;

            if (opts.drawStart)
                this.drawStart = opts.drawStart;
            else
                this.drawStart = this.draw;
        }
    }
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type || "view/background";
}

WSObject.prototype.move = function(dx, dy){
    this.x += dx;
    this.y += dy;
}

WSObject.prototype.setType = function(type){
    this.type = type;
}

WSObject.prototype.moveToXY = function(x, y){
    this.x = x;
    this.y = y;
}

WSObject.prototype.setImgSrc = function(imagePath){
    this.imgsrc = imagePath;
}

function ViewSpace(id){
    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
    this.ew = 0;
    this.eh = 0;
    this.scale = 1;
    this.rotation = 0;
    this.id = id;
    this.type = "view/background";
}

ViewSpace.prototype.move = function(dx, dy){
    if(this.x + dx >= 0 && (this.x + dx + this.ew) <= this.boundaries.x){
        this.x += dx;
    }
    if(this.y + dy >= 0 && (this.y + dy + this.eh) <= this.boundaries.y){
        this.y += dy;
    }
}

ViewSpace.prototype.moveToXY = function(newX, newY){
    if(newX >= 0 && newY >= 0){
        this.x = newX;
        this.y = newY;
    }
}

ViewSpace.prototype.rescale = function(newScale){
    if(this.x + this.w/newScale < this.boundaries.x && this.y + this.h/newScale < this.boundaries.y){
        this.scale = newScale;
        this.ew = this.w/this.scale;
        this.eh = this.h/this.scale; 
    }
    else{
        if (WDEBUG) console.log("Scale out of Range!");
    }
}

ViewSpace.prototype.top = function(){
    return this.y;
}

ViewSpace.prototype.bottom = function(){
    return (this.y + this.eh);
}

ViewSpace.prototype.left = function(){
    return this.x;
}

ViewSpace.prototype.right = function(){
    return (this.x + this.ew);
}

ViewSpace.prototype.center = function(){
    var returnValue = {
        x : (this.x + (this.ew/2)),
        y : (this.y + (this.eh/2))
    };
    return returnValue;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
}

exports.WorkSpace = WorkSpace;
exports.WSObject = WSObject;
