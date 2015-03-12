// WAMS - An API for Multi-Surface Environments

var express = require('express');
var http = require('http');
var io = require('socket.io');
var path = require('path')

var WSOBID = 0;
var userID = 1;
function WorkSpace(port, settings){
    this.app = express();
    this.http = http.createServer(this.app);
    this.io = io.listen(this.http);

    this.app.get('/', function(req, res){
        res.sendfile(path.resolve('../WAMS/client.html'));
    });

    this.app.use(express.static(path.resolve('./Images')));
    this.app.use(express.static(path.resolve('../libs')));

    this.users = [];
    this.wsObjects = [];
    this.boundaries = {
        x : 10000,
        y : 10000
    };
    this.MAX_USERS = 10;
    this.id = port;

    this.settings = settings || this.defaultSettings();

    var self = this;
    this.io.on('connection', function(socket){
        var userVS = new ViewSpace(userID++);
            userVS.boundaries = self.boundaries;
        console.log('User ' + userVS.id + ' connected to workspace ' + self.id);
        var initData = {
            users : self.users,
            wsObjects : self.wsObjects,
            settings : self.settings,
            id : userVS.id
        };

        socket.emit('init', initData);
        
        var initializedLayout = false;
        
        socket.on('reportView', function(vsInfo){
            if(self.users.length < self.MAX_USERS){
                if(userVS.id == vsInfo.id){
                    userVS.x = vsInfo.x;
                    userVS.y = vsInfo.y;
                    userVS.w = vsInfo.w;
                    userVS.h = vsInfo.h;
                    userVS.ew = vsInfo.ew;
                    userVS.eh = vsInfo.eh;
                    userVS.scale = vsInfo.scale;
                    userVS.id = vsInfo.id;
                }
                if(!initializedLayout){
                    initializedLayout = true;
                    if(self.layoutHandler != null){
                        self.layoutHandler(self, userVS);
                    }
                    else{
                        console.log("Layout handler is not attached!");
                    }
                    self.users.push(userVS);
                }
                socket.emit('updateUser', userVS);
                socket.broadcast.emit('updateUser', userVS);
            }
            else if(!initializedLayout){
                self.users.push(userVS);
                socket.send("user_disconnect");
                for (var i = 0; i < users.length; i++) {
                    if(self.users[i].id == userVS.id){
                        self.users.remove(i);
                        break;
                    }
                }
            }
        });

        socket.on('handleDrag', function(vs, x, y, dx, dy){
            if(vs.id == userVS.id){
                if(self.dragHandler != null){
                    for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                        if((self.wsObjects[i].x < x) && (self.wsObjects[i].x  + self.wsObjects[i].w > x) && (self.wsObjects[i].y < y) && (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                            self.dragHandler(self.wsObjects[i], userVS, x, y, dx, dy);
                            socket.emit('updateUser', userVS);
                            socket.broadcast.emit('updateUser', userVS);
                            socket.emit('updateObjects', self.wsObjects);
                            socket.broadcast.emit('updateObjects', self.wsObjects);
                            break;
                        }
                        else if(i == 0){
                            self.dragHandler(userVS, userVS, x, y, dx, dy);
                            socket.emit('updateUser', userVS);
                            socket.broadcast.emit('updateUser', userVS);
                        }  
                    }
                }
                else{
                    console.log("Drag handler is not attached!");
                }
            }
        });

        socket.on('handleClick', function(x, y){
            if(self.clickHandler != null){
                console.log(self.wsObjects.length);
                foundObject = false;
                for (var i = self.wsObjects.length - 1; i >= 0; i--) {
                    if((self.wsObjects[i].x < x) && (self.wsObjects[i].x  + self.wsObjects[i].w > x) && 
                       (self.wsObjects[i].y < y) && (self.wsObjects[i].y  + self.wsObjects[i].h > y)){
                        self.clickHandler(self, self.wsObjects[i], userVS, x, y);
                        socket.emit('updateUser', userVS);
                        socket.broadcast.emit('updateUser', userVS);
                        socket.emit('updateObjects', self.wsObjects);
                        socket.broadcast.emit('updateObjects', self.wsObjects);
                        foundObject = true;
                        break;
                    }
                }
                if(!foundObject){
                    self.clickHandler(self, userVS, userVS, x, y);
                    socket.emit('updateUser', userVS);
                    socket.broadcast.emit('updateUser', userVS);
                    socket.emit('updateObjects', self.wsObjects);
                    socket.broadcast.emit('updateObjects', self.wsObjects);
                }
            }
            else{
                console.log("Click Handler is not attached!");
            }
        });

        socket.on('handleScale', function(vs, newScale){
            if(vs.id == userVS.id){
                if(self.scaleHandler != null){
                    self.scaleHandler(userVS, newScale);
                    socket.emit('updateUser', userVS);
                    socket.broadcast.emit('updateUser', userVS);
                }
                else{
                    console.log("Scale handler is not attached!");
                }
            }
        });

        socket.on('consoleLog', function(toBeLogged){
            console.log(toBeLogged);
        });

        socket.on('disconnect', function(){
            console.log('user ' + userVS.id + ' disconnected from workspace ' + self.id);
            socket.broadcast.emit('removeUser', userVS.id);
            for (var i = 0; i < self.users.length; i++) {
                if(self.users[i].id == userVS.id){
                    self.users.remove(i);
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
}

WorkSpace.prototype.removeWSObject = function(obj){
    for (var i = this.wsObjects.length - 1; i >= 0; i--) {
        if(this.wsObjects[i].id == obj.id){
            this.wsObjects.remove(i);
            break;
        }
    }
}

WorkSpace.prototype.getUsers = function(){
    return this.users;
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

function WSObject(imgSRC, x, y, w, h, type){
    this.imgsrc = imgSRC;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.type = type || "client/background";
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

WSObject.prototype.setImage = function(imagePath){
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
    this.type = "client/background";
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
        console.log("Scale out of Range!");
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