function Laser(x,y,length,speed,ang,col){
    this.pos = new Point(x,y);
    posUtils(this);
    
    this.len = length;
    this.r = length;
    this.spd = speed;
    this.ang = ang;
    this.col = col;
    
    this.draw = function(){
        c.beginPath();
        c.strokeStyle = this.col;
        c.moveTo(this.getX(),this.getY());
        const point = this.secondPoint();
        c.lineTo(point.getX(),point.getY());
        c.stroke();
        c.closePath();
    }
    
    //moves the distance of this.spd
    this.move = function(){
        const newPoint = pointOnCircle(this,this.spd,this.ang); 
        this.setX(newPoint.getX());
        this.setY(newPoint.getY());
    }
    
    //returns x and y of second point. used to decrease ambiguity
    this.secondPoint = function(){
        return pointOnCircle(this,this.len,this.ang);
    }
    
    //returns coordinates of points for use in line-circle collision
    this.getPoints = function(){
        return {
            p1: new Point(this.getX(),this.getY()),
            p2: this.secondPoint()
        };
    }
}