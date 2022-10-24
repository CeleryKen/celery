/**

Space Invaders Functions

**/

var timerTime;

var interval;

//Screen
function Screen(width, height){
		this.canvas = document.createElement("canvas");
		this.canvas.width = this.width = width;
		this.canvas.height = this.height = height;
		this.ctx = this.canvas.getContext("2d");
		this.ctx.stroke();
		
		
		document.getElementById("game").appendChild(this.canvas);
};

Screen.prototype.drawSprite = function(sp, x, y){
		this.ctx.drawImage(sp.img, sp.x, sp.y, sp.w, sp.h, x, y, sp.w, sp.h);
};

Screen.prototype.clear = function(){
		this.ctx.clearRect(0,0, this.width, this.height);
};

Screen.prototype.drawBullet = function(bullet){
		this.ctx.fillStyle = bullet.color;
		this.ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);

};

Screen.prototype.drawWords = function(words){
		this.ctx.fillStyle = words.color;
		this.ctx.font = words.font;
		this.ctx.fillText(words.text, words.x, words.y);

};

Screen.prototype.clearSprite = function(x, y, w, h){

	this.ctx.clearRect(x,y,w,h);

};

//Sprite
function Sprite(img, x, y, w, h){
		this.img = img;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
	
};

function Bullet(x, y, vely, w, h, color, byAlien){
	this.x = x;
	this.y = y;
	this.vely = vely;
	this.w = w;
	this.h = h;
	this.color = color;
	this.byAlien = byAlien;

};

function Words(text, x, y, font, color){
	this.text = text;
	this.font = font;
	this.x = x;
	this.y = y;
	this.color = color;

};

Bullet.prototype.update = function(){
	this.y += this.vely;
};

function Intersection(ax, ay, aw, ah, bx, by, bw, bh){
	return ax< bx+bw && ay< by+bh && bx <ax+aw && by< ay+ah;
}

//InputKeyHandeler
function InputKeyHandeler(){
		this.down = {};
		this.pressed = {};
		
		var _this = this;
		document.addEventListener("keydown", function(event){
			_this.down[event.keyCode] = true;
		});
		
		document.addEventListener("keyup", function(event){
			delete _this.down[event.keyCode];
			delete _this.pressed[event.keyCode];
		});

};

InputKeyHandeler.prototype.isDown = function(code){
		return this.down[code];
};

InputKeyHandeler.prototype.isPressed = function(code){
		if(this.pressed[code]){
			return false;
		}else if(this.down[code]){
			return this.pressed[code] = true;
		}
		
		return false;	
};


function startTimer(duration) {
     timerTime = duration;

    interval = setInterval(function () {

        if (--timerTime < 0) {
            timerTime = duration;
        }

    }, 1000);

}

function stopTimer() {
	
	clearInterval(interval);

}
