'use strict';

function Player(x, y) {
	this.x = x;
	this.y = y;

	this.w = 60;
	this.h = 32;

	this.speed = 96; // pixel per second

	this.bullet_offset = {x: this.w/2, y: 0};
	this.bullet_speed = -20; // pixel per second

	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 1, {x: 0, y: 124}, [{x: 0, y: 0}]);

	this.max_cooldown = 1;
	this.cooldown = 0;
}


Player.prototype.fire = function() {
	if(this.cooldown) {
		return null;
	}

	this.cooldown = this.max_cooldown;

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed);
};


Player.prototype.move = function(direction, minx, maxx) {
	this.x += direction * this.speed;

	if(this.x < minx) {
		this.x = minx;
	}
	else if (this.x + this.w > maxx) {
		this.x = maxx - this.w;
	}
};


Player.prototype.update = function(dt) {
	this.sprite.update();
	if(this.cooldown) {
		this.cooldown -= dt;
		if(this.cooldown < 0) {
			this.cooldown = 0;
		}
	}
};


function Enemy(x, y, type) {
	this.x = x;
	this.y = y;
	this.speed = {x: 64, y: 64}; // pixel per second
	this.bullet_speed = 20; // pixel per second

	switch(type) {
		case 0: {
			this.w = 32;
			this.h = 32;
			this.bullet_offset = {x: this.w/2, y: 0};
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 30, {x: 0, y: 0}, [{x: 0, y: 0}, {x: 32, y: 0}]);
			break;
		}
		case 1: {
			this.w = 44;
			this.h = 32;
			this.bullet_offset = {x: this.w/2, y: 0};
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 30, {x: 0, y: 32}, [{x: 0, y: 0}, {x: 44, y: 0}]);
			break;
		}
		case 2: {
			this.w = 48;
			this.h = 32;
			this.bullet_offset = {x: this.w/2, y: 0};
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 30, {x: 0, y: 64}, [{x: 0, y: 0}, {x: 48, y: 0}]);
			break;
		}
		default:
			console.warn('Unknown Enemy type received: ' + type);
	}

	this.max_cooldown = 1;
	this.cooldown = 0;
}


Enemy.prototype.fire = function() {
	if(this.cooldown) {
		return null;
	}

	this.cooldown = this.max_cooldown;

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed);
};


Enemy.prototype.update = function(dx, dy, minx, maxx, maxy) {
	this.x += dx * this.speed.x;
	this.y += dy * this.speed.y;

	this.sprite.update();

	let reached_border = (this.x < minx || this.x + this.w > maxx);

	if(this.y > maxy) {
		this.y = maxy; // TODO: Player should lose at this point
	}

	return reached_border;
};


function Bullet(x, y, speed) {
	this.x = x;
	this.y = y;
	this.w = 12
	this.h = 20
	this.speed = speed;
	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 5, {x: 0, y: 156}, [{x: 0, y: 0}, {x: 12, y: 0}, {x: 24, y: 0}]);
}


Bullet.prototype.update = function(dt, miny, maxy) {
	this.y += dt * this.speed;
	this.sprite.update(dt);

	/*if(this.y < miny) {
		this.y = miny;
	}
	else if (this.y > maxy) {
		this.y = maxy;
	}*/
};
