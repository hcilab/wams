Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};

HTMLCanvasElement.prototype.getWidth = function() {
    return window.innerWidth;
};

HTMLCanvasElement.prototype.getHeight = function() {
    return window.innerHeight;
};

HTMLCanvasElement.prototype.getCenter = function(){
    return {
        x : this.getWidth()/2,
        y : this.getHeight()/2
    };
}