'use strict';
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
            if (getDist(laser.getX(),laser.getY(),asteroid.getX(),asteroid.getY()) < asteroid.r + laser.r &&
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
    if (obj.getX() - obj.r > W){
        obj.setX(-obj.r);
    }
    if (obj.getX() < -obj.r){
        obj.setX(W + obj.r);
    }
    if (obj.getY() - obj.r > H){
        obj.setY(-obj.r);
    }
    if (obj.getY() < -obj.r){
        obj.setY(H + obj.r);
    }
}

//returns true if obj is outside of screen (must have x y and r attributes)
function outsideScreen(obj){
    return (obj.getX() - obj.r > W ||
            obj.getX() < -obj.r ||
            obj.getY() - obj.r > H || 
            obj.getY() < -obj.r)
}

//deals with controls
function controls(){
    const shiftPress = keysDown[16];
    if (keysDown[65]){ // 'a' key
        if (shiftPress) {plr.ang -= 0.025;}
        else {plr.ang -= 0.05;}
    }
    if (keysDown[68]){ // 'd' key
        if (shiftPress) {plr.ang += 0.025;}
        else {plr.ang += 0.05;}
    }
    if (keysDown[87]){ // 'w' key
        if (shiftPress) {plr.blastOff(0.5);}
        else {plr.blastOff();}
        
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
function pointOnCircle(center,r,ang){
    let newX = center.getX() + (r * Math.cos(ang));
    let newY = center.getY() + (r * Math.sin(ang));
    return new Point(newX,newY);
}

//returns true if the point is located inside of the circle
function pointInCircle(point,circle){
    return getDist(point.getX(),point.getY(),circle.getX(),circle.getY()) < circle.r;
}

//returns true if a line intersects with a circle
function lineCircleCollision(points,circle){
    
    const p1 = points.p1;
    const p2 = points.p2;
    //if either of the two ends is in the circle, return true.
    if (pointInCircle(new Point(p1.getX(),p1.getY()),circle) ||
        pointInCircle(new Point(p2.getX(),p2.getY()),circle)){
        
        return true;
    }
    const circleX = circle.getX();
    const circleY = circle.getY();
    
    //circle to end 1
    const sideA = getDist(circleX,circleY,p1.getX(),p1.getY());
    
    //circle to end 2
    const sideB = getDist(circleX,circleY,p2.getX(),p2.getY());
    
    //end 1 to end 2
    const sideC = getDist(p1.getX(),p1.getY(),p2.getX(),p2.getY());
    
    //angle between side b and c (law of cosines)
    const angleA = Math.acos((sideA * sideA - sideB * sideB - sideC * sideC) / (-2 * sideB * sideC));
    //distance from circle's center to the line
    const dist = Math.sin(angleA) * sideB;
    
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
});


initialize();