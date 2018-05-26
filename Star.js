function Star(x,y,r){
    this.pos = new Point(x,y);
    posUtils(this);

    this.r = r;
    this.col = Color.randomBright(160);
    
    this.draw = function(){
        starscape.beginPath();
        starscape.fillStyle = this.col.constructCol();
        starscape.arc(this.getX(),this.getY(),this.r,0,2*Math.PI);
        starscape.fill();
        starscape.closePath();
    }
}