function Point(x=0,y=0){
    this.x = x;
    this.y = y;
    pointUtils(this);
}
function pointUtils(obj){
    obj.getX = function(){return this.x};
    obj.getY = function(){return this.y};
    obj.setX = function(x){this.x = x};
    obj.setY = function(y){this.y = y};
    obj.changeX = function(dx){this.x += dx};
    obj.changeY = function(dy){this.y += dy};
}
function posUtils(obj){
    obj.getX = function(){return this.pos.x};
    obj.getY = function(){return this.pos.y};
    obj.setX = function(x){this.pos.x = x};
    obj.setY = function(y){this.pos.y = y};
    obj.changeX = function(dx){this.pos.x += dx};
    obj.changeY = function(dy){this.pos.y += dy};
}