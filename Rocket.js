console.log('Use the left and right arrow keys to rotate your ship.\nUse the up arrow to blast off forward.\nPress space to shoot lasers at the asteroids.');


const canvas = document.getElementById("myCanvas");
const scoreBoard = document.getElementById("scoreBoard");
const stars = document.getElementById("stars");

const hud = scoreBoard.getContext("2d");
const c = canvas.getContext("2d");
const starscape = stars.getContext("2d");

const W = 900;
const H = 900;
setSize(canvas);
setSize(scoreBoard);
setSize(stars);

let keysDown = [];

let particles = [];
let lasers = [];
let asteroids = [];

let sounds = [];

let score = 0;
let prevScore;

function Star(x,y,r){
    this.x = x;
    this.y = y;
    this.r = r;
    this.col = Color.randomBright(160);
    
    this.draw = function(){
        starscape.beginPath();
        starscape.fillStyle = this.col.constructCol();
        starscape.arc(this.x,this.y,this.r,0,2*Math.PI);
        starscape.fill();
        starscape.closePath();
    }
}

function Asteroid(x,y,r,vel){
    this.x = x;
    this.y = y;
    this.r = r;
    
    this.rotation = 0;
    this.vel = vel;
    
    this.points = Asteroid.roughen(this.r);
    
    this.health = Math.ceil(r / 5) - 1;
    
    //11 is just an arbitrary number
    this.scoreVal = 2 * (11-this.health);
    this.col = 'gray';
    
    this.draw = function(){
        
        /*Draw bounding collision circle for testing
        c.beginPath();
        c.fillStyle = 'white';
        c.arc(this.x,this.y,this.r,0,2*Math.PI);
        c.fill();
        c.closePath();
        */
        
        c.beginPath();
        c.fillStyle = this.col;
        c.strokeStyle = 'white';
        
        let coord = pointOnCircle(this.x,this.y,this.points[0],this.rotation);
        c.moveTo(coord.x,coord.y);
        
        for (let i = 1; i < this.points.length; i++){
            coord = pointOnCircle(this.x,this.y,this.points[i],(i/this.points.length) * (2*Math.PI) + this.rotation);
            c.lineTo(coord.x,coord.y);
        }
        
        coord = pointOnCircle(this.x,this.y,this.points[0],this.rotation);
        c.lineTo(coord.x,coord.y);
        c.fill();
        c.stroke();
        
        
        this.rotation += this.vel.rot;
    }
    this.move = function(){
        this.x += this.vel.x;
        this.y += this.vel.y;
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
            let newAsteroid = new Asteroid(this.x,this.y,newRadius,newVel);
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



function Laser(x,y,length,speed,ang,col){
    this.x = x;
    this.y = y;
    this.len = length;
    this.r = length;
    this.spd = speed;
    this.ang = ang;
    this.col = col;
    
    this.draw = function(){
        c.beginPath();
        c.strokeStyle = this.col;
        c.moveTo(this.x,this.y);
        let point = this.secondPoint();
        c.lineTo(point.x,point.y);
        c.stroke();
        c.closePath();
    }
    
    //moves the distance of this.spd
    this.move = function(){
        let newPoint = pointOnCircle(this.x,this.y,this.spd,this.ang); 
        this.x = newPoint.x;
        this.y = newPoint.y;
    }
    
    //returns x and y of second point. used to decrease ambiguity
    this.secondPoint = function(){
        return pointOnCircle(this.x,this.y,this.len,this.ang);
    }
    
    //returns coordinates of points for use in line-circle collision
    this.getPoints = function(){
        let secondPoint = this.secondPoint();
        return {
            x1:this.x,
            y1:this.y,
            x2:secondPoint.x,
            y2:secondPoint.y
        };
    }
}
function Particle(x,y,r,col,vel,life,smoothFade = true,specialFunc){
    this.x = x;
    this.y = y;
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
        drawCircle(this.x,this.y,this.r,color);
    };
    this.update = function(){
        //change position
        this.x += this.vel.x;
        this.y += this.vel.y;
        
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

//display
let dis = {
    score: plr.score,
    prevScore: undefined,
    
    lives: plr.lives,
    prevLives: undefined,
    
    //Draw all information
    draw: function(){
        hud.fillStyle = 'white';
        hud.strokeStyle = 'black';
        hud.font = '20px Verdana';
        
        if (this.score != this.prevScore){
            this.prevScore = this.score;
            hud.clearRect(0,0,200,200);
            hud.fillText('Score: '+ this.score,15,15);
        }
        if (this.lives != this.prevLives){
            this.prevLives = this.lives;
            hud.clearRect(W-200,0,200,200);
            hud.fillText('Lives: '+ this.lives,W-185,15);
        }
    },
    updateValues: function(){
        this.lives = plr.lives;
        this.score = plr.score;
    }
}

function initialize(){
    sounds['laser'] = new Audio('Laser.mp3');
    sounds['laser'].volume = 0;
    sounds['laser'].play();
    
    for (let i = 0; i < 15; i++){
        let velX = rand(1,-1);
        let velY = rand(1,-1);
        let radius = rand(30,5);
        let velRot = rand(1/radius,-1/radius);
        
        let newAsteroid = new Asteroid(rand(W-100,100),rand(H-100,100),radius,{x:velX,y:velY,rot:velRot});
        asteroids.push(newAsteroid);
    }
    starscape.fillStyle = 'black';
    starscape.fillRect(0,0,W,H);
    for (let i = 0; i < 30; i++){
        const randX = rand(W);
        const randY = rand(H);
        const randR = 1+rand(1);
        new Star(randX,randY,randR).draw();
    }
    
    loop();
}

function loop(){
    c.clearRect(0,0,W,H);
    controls();
    for (let particle of particles){
        particle.draw();
    }
    
    for (let laser of lasers){
        laser.draw();
    }
    
    for (let asteroid of asteroids){
        asteroid.draw();
    }
    
    plr.draw();
    
    dis.updateValues();
    dis.draw();
    
    update();
    requestAnimationFrame(loop);
}

function update(){
    
    plr.update();
    
    for (let i = 0; i < particles.length; i++){
        let particle = particles[i];
        particle.update();
        if (particle.life === 0){
            particles.splice(i,1);
            i--;
        }
        screenWrap(particle);
    }
    
    laserLoop: for (let i = 0; i < lasers.length; i++){
        let laser = lasers[i];
        laser.move();
        if (outsideScreen(laser)){
            removeLaser();
            continue laserLoop;
        }
        for (let j = 0; j < asteroids.length; j++){
            let asteroid = asteroids[j];
            if (getDist(laser.x,laser.y,asteroid.x,asteroid.y) < asteroid.r + laser.r &&
                lineCircleCollision(laser.getPoints(),asteroid)){
                
                asteroid.health--;
                removeLaser();
                continue laserLoop;
            }
        }
        function removeLaser(){
            lasers.splice(i,1);
            i--;
        }
    }
    
    for (let i = 0; i < asteroids.length; i++){
        let asteroid = asteroids[i];
        
        asteroid.move();
        if (!plr.invincible && plr.circleCollision(asteroid)){
            plr.lives--;
            plr.setInvincible(150);
            console.log('collision');
        }
        if (asteroid.health <= 0){
            plr.score += asteroid.getValue();
            asteroids = asteroids.concat(asteroid.burst());
            asteroids.splice(i,1);
            continue;
        }
        screenWrap(asteroid);
    }
}

//takes an object with an x y and r, and wraps them around the screen.
function screenWrap(obj){
    if (obj.x - obj.r > W){
        obj.x = -obj.r;
    }
    if (obj.x < -obj.r){
        obj.x = W + obj.r;
    }
    if (obj.y - obj.r > H){
        obj.y = -obj.r;
    }
    if (obj.y < -obj.r){
        obj.y = H + obj.r;
    }
}

//returns true if obj is outside of screen (must have x y and r attributes)
function outsideScreen(obj){
    return (obj.x - obj.r > W ||
            obj.x < -obj.r ||
            obj.y - obj.r > H || 
            obj.y < -obj.r)
}

//deals with controls
function controls(){
    if (keysDown[65]){ // 'a' key
        plr.ang -= 0.05;
    }
    if (keysDown[68]){ // 'd' key
        plr.ang += 0.05;
    }
    if (keysDown[87]){ // 'w' key
        plr.blastOff();
    }
    if (keysDown[32]){ // space bar
        if (plr.shootDelay === 0){
            plr.shoot();
        }
    }
}

//draws a circle on the canvas
function drawCircle(x,y,r,col){
    c.beginPath();
    c.fillStyle = col;
    c.arc(x,y,r,0,2*Math.PI);
    c.fill();
    c.closePath();
}

//returns the coordinates of a point on the perimeter of a given circle and angle
function pointOnCircle(x,y,r,ang){
    let newX = x + (r * Math.cos(ang));
    let newY = y + (r * Math.sin(ang));
    return {x:newX,y:newY};
}

//returns true if the point is located inside of the circle
function pointInCircle(point,circle){
    return getDist(point.x,point.y,circle.x,circle.y) < circle.r;
}

//returns true if a line intersects with a circle
function lineCircleCollision(points,circle){
    
    //if either of the two ends is in the circle, return true.
    if (pointInCircle({x:points.x1,y:points.y1},circle) ||
        pointInCircle({x:points.x2,y:points.y2},circle)){
        
        return true;
    }
    //circle to end 1
    let sideA = getDist(circle.x,circle.y,points.x1,points.y1);
    //circle to end 2
    let sideB = getDist(circle.x,circle.y,points.x2,points.y2);
    //end 1 to end 2
    let sideC = getDist(points.x1,points.y1,points.x2,points.y2);
    
    //angle between side b and c
    let angleA = Math.acos((sideA * sideA - sideB * sideB - sideC * sideC) / (-2 * sideB * sideC));
    //distance from circle's center to the line
    let dist = Math.sin(angleA) * sideB;
    
    return circle.r > dist;
    
}

//returns the distance between two points
function getDist(x1,y1,x2,y2){
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.sqrt(dx ** 2 + dy ** 2);
}

//takes a magnitude and angle
//returns an object with x and y components of the vector
function toComponents(mag,ang){
    return {x:mag*Math.cos(ang),y:mag*Math.sin(ang)};
}

//takes x and y components
//returns an object containing the magnitude and angle as mag and ang
function toMagAng(x,y){
    let magnitude = getDist(0,0,x,y);
    let angle = Math.cos(x/magnitude);
    return {mag:magnitude,ang:angle};
}

//returns random number in given range
function rand(max,min = 0){
    let range = max - min;
    return min + (Math.random() * range);
}

function setSize(canvas){
    canvas.width = W;
    canvas.height = H;
}

addEventListener('keydown', function(e){
    keysDown[e.keyCode] = true;
});
addEventListener('keyup', function(e){
    delete keysDown[e.keyCode];
});

//disable right clicking on accident
addEventListener('contextmenu', function(e){
    e.preventDefault();
})


initialize();
