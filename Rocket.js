const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const W = window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;

let keysDown = [];

let plr = {
	x:W/2,
	y:H/2,
	s:20,
	speed: 3,
	ang: Math.PI*1.5,
	draw: function(){
		let point1 = pointOnCircle(this.x,this.y,this.s,0 + this.ang);
		let point2 = pointOnCircle(this.x,this.y,this.s,5*Math.PI/6 + this.ang);
		let point3 = pointOnCircle(this.x,this.y,this.s,7*Math.PI/6 + this.ang);
		
		c.beginPath();
		c.fillStyle = 'blue';
		c.moveTo(point1.x,point1.y);
		c.lineTo(point2.x,point2.y);
		c.lineTo(point3.x,point3.y);
		c.fill();
		c.closePath();
	},
	
	move: function(){
		this.x += this.speed * Math.cos(this.ang);
		this.y += this.speed * Math.sin(this.ang);
	}
}

function loop(){
	c.clearRect(0,0,W,H);
	controls();
	
	plr.draw();
	
	requestAnimationFrame(loop);
}
function controls(){
	if (keysDown[65]){ // 'a' key
		plr.ang -= 0.05;
	}
	if (keysDown[68]){ // 'd' key
		plr.ang += 0.05;
	}
	if (keysDown[87]){ // 'w' key
		plr.move();
	}
}

function drawCircle(x,y,r,col){
	c.beginPath();
	c.fillStyle = col;
	c.arc(x,y,r,0,2*Math.PI);
	c.fill();
	c.closePath();
}
function pointOnCircle(x,y,r,ang){
	let newX = x + (r * Math.cos(ang));
	let newY = y + (r * Math.sin(ang));
	return {x:newX,y:newY};
}



addEventListener('keydown', function(e){
	keysDown[e.keyCode] = true;
});
addEventListener('keyup', function(e){
	delete keysDown[e.keyCode];
});

loop();
