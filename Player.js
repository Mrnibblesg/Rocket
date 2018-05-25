let plr = {
    x:500,
    y:500,
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
        let point1 = points[0];
        let point2 = points[1];
        let point3 = points[2];
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
        c.moveTo(point1.x,point1.y);
        c.lineTo(point2.x,point2.y);
        c.lineTo(point3.x,point3.y);
        c.lineTo(point1.x,point1.y);
        c.fill();
        c.stroke();
        c.closePath();
    },
    update: function(){
        plr.x += plr.vel.x;
        plr.y += plr.vel.y;
        
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
    
    blastOff: function(){
        this.vel.x += this.speed * Math.cos(this.ang);
        this.vel.y += this.speed * Math.sin(this.ang);
        
        let location = pointOnCircle(this.x,this.y,this.r - 5,Math.PI + this.ang);
        for (let i = 0; i < 3; i++){
            let vector = toComponents(2,this.ang);
            let velX = -vector.x + rand(0.5,-0.5) + this.vel.x;
            let velY = -vector.y + rand(0.5,-0.5) + this.vel.y;
            let color = 'rgba(255,250,0,1)';
            
            let newParticle = new Particle(location.x,location.y,4,color,{x:velX,y:velY},50,true,
            function(){
                this.col.g = Math.floor(this.col.g/1.2);
            });
            particles.push(newParticle);
        }
    },
    
    explode: function(){
        
    },
    
    circleCollision: function(circle){
        if (getDist(this.x,this.y,circle.x,circle.y) > this.r + circle.r){
            return false;
        }
        //the ship's corners
        let points = this.getPoints();
        let point1 = points[0];
        let point2 = points[1];
        let point3 = points[2];
        
        return (lineCircleCollision({x1:point1.x,y1:point1.y,x2:point2.x,y2:point2.y},circle) ||
                lineCircleCollision({x1:point1.x,y1:point1.y,x2:point3.x,y2:point3.y},circle) ||
                lineCircleCollision({x1:point2.x,y1:point2.y,x2:point3.x,y2:point3.y},circle));
    },
    
    //first point is the front, 
    //second point is next point clockwise
    //third is next clockwise
    getPoints: function(){
        return [
            pointOnCircle(this.x,this.y,this.r,0 + this.ang),
            pointOnCircle(this.x,this.y,this.r,5*Math.PI/6 + this.ang),
            pointOnCircle(this.x,this.y,this.r,7*Math.PI/6 + this.ang)
        ];
    },
    move: function(){
        this.x += this.vel.x;
        this.y += this.vel.y;
    },
    shoot: function(){
        //you cant shoot if the delay isnt done yet
        if (this.shootDelay > 0){
            return;
        }
        
        //play sound
        sounds['laser'].volume = 0.02;
        sounds['laser'].play();
        
        let laserLoc = this.getPoints()[0];
        let newLaser = new Laser(laserLoc.x,laserLoc.y,20,10,this.ang,'rgb(42,255,0)');
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
    }
}
