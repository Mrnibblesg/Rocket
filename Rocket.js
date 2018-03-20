const canvas = document.getElementById("myCanvas");
const c = canvas.getContext("2d");
const W = window.innerWidth;
const H = window.innerHeight;
canvas.width = W;
canvas.height = H;

let plr = {
	x:W/2,
	y:H/2,
	s:20,
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
	}
}

function loop(){
	c.clearRect(0,0,W,H);
	plr.draw();
	plr.ang+= 0.01;
	requestAnimationFrame(loop);
}
drawCircle(50,50,50,'blue');
let newPoint = pointOnCircle(50,50,50,Math.PI/2);
drawCircle(newPoint.x,newPoint.y,2,'red');
plr.draw();
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
loop();