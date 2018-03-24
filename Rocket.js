const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const W = window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;

let keysDown = [];
let particles = [];
let asteroids = [];

function Asteroid(x,y,r,vel){
	this.x = x;
	this.y = y;
	this.r = r;
	this.vel = vel;
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
}
function Laser(x,y,length,ang,col){
	
}


function Particle(x,y,r,col,vel,life){
	this.x = x;
	this.y = y;
	this.r = r;
	this.col = col;
	
	this.vel = vel;
	this.life = life;
	
	this.draw = function(){
		this.col = this.constructCol();
		drawCircle(this.x,this.y,this.r,this.col);
	};
	this.update = function(){
		//change position
		this.x += this.vel.x;
		this.y += this.vel.y;
		
		//change transparency
		this.colParts.alpha /= 1.1;
		
		
		//decrease lifespan
		this.life--;
	};
	this.getCols = function(col){
		let cols = col.substring(col.indexOf('(')+1,col.length-1).split(',');
		return {red:+cols[0],green:+cols[1],blue:+cols[2],alpha:+cols[3]};
	};
	this.constructCol = function(){
		return 'rgba(' + this.colParts.red + ',' + this.colParts.green + ',' + this.colParts.blue + ',' + this.colParts.alpha + ')';
	}
	
	this.colParts = this.getCols(col);
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
	draw: function(){
		//the ship's corners
		let points = this.getPoints();
		let point1 = points[0];
		let point2 = points[1];
		let point3 = points[2];
		
		c.beginPath();
		c.strokeStyle = 'white';
		c.fillStyle = 'blue';
		c.moveTo(point1.x,point1.y);
		c.lineTo(point2.x,point2.y);
		c.lineTo(point3.x,point3.y);
		c.lineTo(point1.x,point1.y);
		c.fill();
		c.stroke();
		c.closePath();
	},
	
	blast: function(){
		this.vel.x += this.speed * Math.cos(this.ang);
		this.vel.y += this.speed * Math.sin(this.ang);
		
		let location = pointOnCircle(this.x,this.y,this.r - 5,Math.PI + this.ang);
		for (let i = 0; i < 3; i++){
			let vector = toComponents(2,this.ang);
			let velX = -vector.x + rand(0.5,-0.5) + this.vel.x;
			let velY = -vector.y + rand(0.5,-0.5) + this.vel.y;
			let color = 'rgba(255,0,0,1)';
			
			let newParticle = new Particle(location.x,location.y,4,color,{x:velX,y:velY},50);
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
	}
}

function initialize(){
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
	for (let asteroid of asteroids){
		asteroid.draw();
	}
	
	for (let particle of particles){
		particle.draw();
	}
	plr.draw();
	update();
	requestAnimationFrame(loop);
}
function update(){
	
	plr.x += plr.vel.x;
	plr.y += plr.vel.y;
	//plr.vel.y += 0.02;
	
	//Screen wrapping
	screenWrap(plr);
	
	
	for (let asteroid of asteroids){
		asteroid.move();
		if (plr.circleCollision(asteroid)){
			console.log('collision');
		}
		screenWrap(asteroid);
	}
	
	for (let i = 0; i < particles.length; i++){
		let particle = particles[i];
		particle.update();
		if (particle.life === 0){
			particles.splice(i,1);
			i--;
		}
		screenWrap(particle);
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
	return Math.sqrt(dx * dx + dy * dy);
}

//takes a magnitude and angle
//returns an object with x and y components of the vector
function toComponents(mag,ang){
	return {x:mag*Math.cos(ang),y:mag*Math.sin(ang)};
}

//returns random number in given range
function rand(max,min = 0){
	let range = max - min;
	return min + (Math.random() * range);
}


addEventListener('keydown', function(e){
	switch (e.keyCode){
		case 32:{
			plr.shoot();
			break;
		}
	}
	
	keysDown[e.keyCode] = true;
});
addEventListener('keyup', function(e){
	delete keysDown[e.keyCode];
});

initialize();
