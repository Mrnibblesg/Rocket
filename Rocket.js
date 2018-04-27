const canvas = document.getElementById("myCanvas");
const scoreBoard = document.getElementById("scoreBoard");
const hud = scoreBoard.getContext("2d");
const c = canvas.getContext("2d");
const W = window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;
scoreBoard.width = W;
scoreBoard.height = H;

let keysDown = [];

let particles = [];
let lasers = [];
let asteroids = [];

let sounds = [];

let score = 0;
let prevScore;

function Asteroid(x,y,r,vel){
	this.x = x;
	this.y = y;
	this.r = r;
	this.vel = vel;
	this.health = Math.ceil(r / 5) - 1;
	
	//11 is just an arbitrary number
	this.scoreVal = 2 * (11-this.health);
	this.col = 'gray';
	
	this.draw = function(){
		c.beginPath();
		c.fillStyle = this.col;
		c.arc(this.x,this.y,this.r,0,2*Math.PI);
		c.fill();
		c.closePath();
	}
	this.move = function(){
		this.x += this.vel.x;
		this.y += this.vel.y;
	}
	
	//returns an array of smaller asteroids
	this.burst = function(){
		//create 2-3 smaller asteroids
		if (this.r <= 10){
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
			
			let newAsteroid = new Asteroid(this.x,this.y,this.r - 6,newVel);
			newAsteroids.push(newAsteroid);
		}
		return newAsteroids;
	}
	
	//returns score value
	this.getValue = function(){
		return this.scoreVal;
	}
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
	score: 0,
	prevScore: undefined,
	
	lives: 3,
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
	}
}

let plr = {
	x:W/2,
	y:H/2,
	vel: {
		x: 0,
		y: 0
	},
	r:20,
	speed: 0.1,
	ang: Math.PI*1.5,
	
	col: Color.createFromRgba('rgba(0,0,255,1)'),
	
	
	delayMax: 20,
	shootDelay: 0,
	
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
		if (plr.invincible){
			if (plr.invinTimer == 0){
				plr.invincible = false;
			}
			else{
				plr.invinTimer--;
			}
		}
		
		//Screen wrapping
		screenWrap(plr);
		
		//Decrease shooting delay
		if (plr.shootDelay > 0){
			plr.shootDelay--;
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
	
	blast: function(){
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
	//third is point closest to second
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

function initialize(){
	sounds['laser'] = new Audio('Laser.mp3');
	sounds['laser'].volume = 0;
	sounds['laser'].play();
	
	for (let i = 0; i < 30; i++){
		let velX = rand(1,-1);
		let velY = rand(1,-1);
		let newAsteroid = new Asteroid(rand(W-100,100),rand(H-100,100),rand(30,5),{x:velX,y:velY});
		asteroids.push(newAsteroid);
	}
	
	loop();
}

function loop(){
	c.fillStyle = 'black';
	c.fillRect(0,0,W,H);
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
			dis.lives--;
			plr.setInvincible(150);
			console.log('collision');
		}
		if (asteroid.health <= 0){
			dis.score += asteroid.getValue();
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
		plr.blast();
	}
	if (keysDown[32]){ // space bar
		if (sounds['laser'].ended){
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
