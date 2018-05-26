let plr = {
    pos: new Point(500,500),
    
    vel: {
        x: 0,
        y: 0
    },
    r:20,
    speed: 0.1,
    ang: Math.PI*1.5,
    
    col: Color.createFromRgba('rgba(0,0,255,1)'),
    
    score: 0,
    
    
    delayMax: 20,
    shootDelay: 0,
    
    lives: 3,
    invincible: false,
    maxInvinTimer: 0,
    invinTimer: 0,
    
    draw: function(){
        //the ship's corners
        let points = this.getPoints();
        let point1 = points.p1;
        let point2 = points.p2;
        let point3 = points.p3;
        let drawCol = this.col.constructCol();
        
        
        if (this.invincible){
            let flash = Math.ceil(125*(this.invinTimer/this.maxInvinTimer));
            this.col.r = flash;
            this.col.g = flash;
            drawCol = this.col.constructCol();
        }
        
        
        c.beginPath();
        c.strokeStyle = 'white';
        c.fillStyle = drawCol;
        c.moveTo(point1.getX(),point1.getY());
        c.lineTo(point2.getX(),point2.getY());
        c.lineTo(point3.getX(),point3.getY());
        c.lineTo(point1.getX(),point1.getY());
        c.fill();
        c.stroke();
        c.closePath();
    },
    update: function(){
       this.move();
        
        //Screen wrapping
        screenWrap(plr);
        
        if (plr.invincible){
            if (plr.invinTimer == 0){
                plr.invincible = false;
            }
            else{
                plr.invinTimer--;
            }
        }
        
        //Decrease shooting delay
        if (plr.shootDelay > 0){
            plr.shootDelay--;
        }
        
        if (this.lives === 0){
            this.explode();
        }
    },
    
    setInvincible: function(time){
        if (time === 0){
            return;
        }
        
        this.invincible = true;
        this.invinTimer = time;
        this.maxInvinTimer = time;
    },
    
    blastOff: function(multiplier=1){
        const finalSpd = multiplier * this.speed;
        
        this.vel.x += finalSpd * Math.cos(this.ang);
        this.vel.y += finalSpd * Math.sin(this.ang);
        
        let location = pointOnCircle(this,this.r - 5,Math.PI + this.ang);
        for (let i = 0; i < 3 * multiplier; i++){
            let vector = toComponents(2,this.ang);
            let velX = -vector.x + rand(0.5,-0.5) + this.vel.x;
            let velY = -vector.y + rand(0.5,-0.5) + this.vel.y;
            let color = 'rgba(255,250,0,1)';
            
            let newParticle = new Particle(location.getX(),location.getY(),4,color,{x:velX,y:velY},50,true,
            function(){
                this.col.g = Math.floor(this.col.g/1.2);
            });
            particles.push(newParticle);
        }
    },
    
    explode: function(){
        
    },
    
    circleCollision: function(circle){
        if (getDist(this.getX(),this.getY(),circle.getX(),circle.getY()) > this.r + circle.r){
            return false;
        }
        //the ship's corners
        let points = this.getPoints();
        let point1 = points.p1;
        let point2 = points.p2;
        let point3 = points.p3;
        
        return (lineCircleCollision({p1:point1, p2: point2},circle) ||
                lineCircleCollision({p1:point1, p2: point3},circle) ||
                lineCircleCollision({p1:point2, p2: point3},circle));
    },
    
    //first point is the front, 
    //second point is next point clockwise
    //third is next clockwise
    getPoints: function(){
        const point1 = pointOnCircle(this,this.r,0 + this.ang);
        const point2 = pointOnCircle(this,this.r,5*Math.PI/6 + this.ang);
        const point3 = pointOnCircle(this,this.r,7*Math.PI/6 + this.ang);
        
        return {
            p1: point1,
            p2: point2,
            p3: point3
        };
    },
    move: function(){
        this.changeX(this.vel.x);
        this.changeY(this.vel.y);
    },
    shoot: function(){
        //you cant shoot if the delay isnt done yet
        if (this.shootDelay > 0){
            return;
        }
        
        //play sound
        sounds['laser'].volume = 0.02;
        sounds['laser'].play();
        
        let laserLoc = this.getPoints().p1;
        let newLaser = new Laser(laserLoc.getX(),laserLoc.getY(),20,10,this.ang,'rgb(42,255,0)');
        lasers.push(newLaser);
        
        //generate particles
        
        
        
        for (let i = 0; i < 10; i++){
            
            //add a little variation in the particle's angle and speed
            let extraAng = rand(Math.PI/12,-Math.PI/12);
            let extraSpd = rand(2,-2);
            //particle vector is speed of the particles relative to the ship
            let particleVector = toComponents(5 + extraSpd,this.ang + extraAng);
            
            
            //newVel combines the relative speed with the actual speed
            let newVel = {
                x:this.vel.x + particleVector.x,
                y:this.vel.y + particleVector.y
            }
            
            let newParticle = new Particle(laserLoc.x,laserLoc.y,1,'rgba(42,255,0,0.125)',newVel,10,false);
            particles.push(newParticle);
        }
        this.shootDelay = this.delayMax;
    },
}
posUtils(plr);