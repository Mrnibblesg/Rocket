function Asteroid(x,y,r,vel){
    this.pos = new Point(x,y);
    posUtils(this);
    
    this.r = r;
    
    this.rotation = 0;
    this.vel = vel;
    
    this.points = Asteroid.roughen(this.r);
    this.health = Math.ceil(r / 5) - 1;
    
    //11 is an arbitrary number
    this.scoreVal = 2 * (11-this.health);
    this.col = 'gray';
    
    this.draw = function(){
        
        //Draw bounding collision circle for testing
        /* c.beginPath();
        c.fillStyle = 'white';
        c.arc(this.getX(),this.getY(),this.r,0,2*Math.PI);
        c.fill();
        c.closePath(); */
       
        
        c.beginPath();
        c.fillStyle = this.col;
        c.strokeStyle = 'white';
        
        let coord = pointOnCircle(this,this.points[0],this.rotation);
        c.moveTo(coord.getX(),coord.getY());
        
        for (let i = 1; i < this.points.length; i++){
            coord = pointOnCircle(this,this.points[i],(i/this.points.length) * (2*Math.PI) + this.rotation);
            c.lineTo(coord.getX(),coord.getY());
        }
        
        coord = pointOnCircle(this,this.points[0],this.rotation);
        c.lineTo(coord.getX(),coord.getY());
        c.fill();
        c.stroke();
        
        
        this.rotation += this.vel.rot;
    }
    this.move = function(){
        this.changeX(this.vel.x);
        this.changeY(this.vel.y);
    }
    
    //returns an array of smaller asteroids
    this.burst = function(){
        //create 2-3 smaller asteroids
        if (this.r <= 12){
            return [];
        }
        
        //choose 2 or 3 asteroids to create
        let amt = Math.ceil(rand(3,1));
        let newAsteroids = [];
        for (let i = 0; i < amt; i++){
            
            //choose a new direction
            //the new random angle does not depend on what this one is already
            let newAngle = (2*Math.PI)*(i/amt) + rand(Math.PI/2,-Math.PI/2);
            let newVel = toComponents(getDist(0,0,this.vel.x,this.vel.y),newAngle);
            let newRadius = this.r - 6
            newVel.rot = rand(1/newRadius,-1/newRadius);
            let newAsteroid = new Asteroid(this.getX(),this.getY(),newRadius,newVel);
            newAsteroids.push(newAsteroid);
        }
        return newAsteroids;
    }
    
    //returns score value
    this.getValue = function(){
        return this.scoreVal;
    }
}

//takes a radius
//returns an array of radii to be connected in order by a line
Asteroid.roughen = function(r){
    let asteroidEdges = [];
    const points = r / 2;
    
    let distance = r+3;
    for (let i = 0; i < points; i++){
        let magnitude = toMagAng(distance*Math.cos(i/points),distance*Math.sin(i/points)).mag;
        magnitude += rand(magnitude/10,-magnitude/10);
        asteroidEdges.push(magnitude);
    }
    return asteroidEdges;
}