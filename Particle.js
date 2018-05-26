function Particle(x,y,r,col,vel,life,smoothFade = true,specialFunc){
    this.pos = new Point(x,y);
    posUtils(this);
    
    this.r = r;
    this.col = Color.createFromRgba(col);//new Color(col);
    this.vel = vel;
    this.maxLife = life;
    this.life = life;
    this.smoothFade = smoothFade;
    
    //a special function to run
    this.special = specialFunc;
    
    this.draw = function(){
        const color = this.col.constructCol();
        drawCircle(this.getX(),this.getY(),this.r,color);
    };
    this.update = function(){
        //change position
        this.changeX(this.vel.x);
        this.changeY(this.vel.y);
        
        //change transparency
        if (this.smoothFade){
            this.col.a /= 1.1;
        }
        else{
            this.col.a = this.life / this.maxLife;
        }
        
        //decrease lifespan
        this.life--;
        
        //special function, parameter to do something special to the particle
        if (this.special){
            this.special();
        }
    };
}