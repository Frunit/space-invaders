'use strict';


import {Sprite} from './sprite.js';


/**
 * `Entity` is an abstract object for all elements on the screen. Its purpose is
 * to ensure that certain properties are always present, no matter what kind of
 * entity it is.
 * @constructor
 * @abstract
 */
function Entity() {
	// The following properties *should* be overwritten by the inheriting "class"
	this.object = 'abstract';
	this.w = 0;
	this.h = 0;
	this.x = 0;
	this.y = 0;
	this.sprite = null;

	// The following properties *may* be overwritten by the inheriting "class"
	this.score_value = 0;
	this.off_time = -1;
	this.speed = {x: 0, y: 0};
	this.active = true;
	this.collidable = true;
}


/**
 * `Player` is the object for the space ship controlled by the player.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the player pointing to its center
 * @param {number} y - The initial y coordinate (from top) of the player pointing to its center
 * @param {number} num - The number of the player (should be 0 or 1)
 */
function Player(x, y, num) {
	Entity.call(this);
	this.object = 'player';
	this.w = 60;
	this.h = 32;

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);

	this.speed.x = 96; // pixel per second

	this.bullet_offset = {x: this.w/2, y: 0};
	this.bullet_double_x_offset = 20;
	this.bullet_speed = {x: 0, y: -300}; // pixel per second

	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);

	this.score = 0;
	this.lives = 3;
	this.num = num;

	this.max_cooldown = 1;
	this.rapid_cooldown = 0.3;
	this.cooldown = 0;

	this.is_dead = false;

	this.invulnerable = 0;
	this.double_laser = 0;
	this.rapid_fire = 0;
}


/**
 * `Player.reset` resets the player except for the position, score, lives, and
 * death status.
 */
Player.prototype.reset = function() {
	this.w = 60;
	this.h = 32;
	this.speed.x = 96; // pixel per second
	this.bullet_offset = {x: this.w/2, y: 0};
	this.bullet_double_x_offset = 20;
	this.bullet_speed = {x:0, y:-300}; // pixel per second

	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);

	this.max_cooldown = 1;
	this.rapid_cooldown = 0.3;
	this.cooldown = 0;
	this.off_time = -1;
	this.collidable = true;

	this.invulnerable = 0;
	this.double_laser = 0;
	this.rapid_fire = 0;
};


/**
 * `Player.fire` fires a bullet if the last bullet was long enough ago (i.e. the
 * cooldown is ok). Respects rapid_fire and double_laser.
 * @returns {Bullet[]} A list of Bullet objects if the ship fired. The list is empty if the cooldown prevented firing.
 */
Player.prototype.fire = function() {
	// TODO: The cooldown should be ignored, if no bullet of the player is present anywhere.
	// Still, an inactive player (hidden or dead) should not shoot!
	if(this.cooldown) {
		return [];
	}

	this.cooldown = this.rapid_fire ? this.rapid_cooldown : this.max_cooldown;

	let bullets = [];

	if(this.double_laser) {
		bullets.push(
			new Bullet(
				this.x + this.bullet_offset.x - this.bullet_double_x_offset,
				this.y + this.bullet_offset.y,
				this.bullet_speed,
				0,
				this.num
			)
		);
		bullets.push(
			new Bullet(
				this.x + this.bullet_offset.x + this.bullet_double_x_offset,
				this.y + this.bullet_offset.y,
				this.bullet_speed,
				0,
				this.num
			)
		);
	}
	else {
		bullets.push(
			new Bullet(
				this.x + this.bullet_offset.x,
				this.y + this.bullet_offset.y,
				this.bullet_speed,
				0,
				this.num
			)
		);
	}

	return bullets;
};


/**
 * `Player.move` moves the player, respecting boundaries.
 * @param {number} direction - A vector depending on direction and time delta. Negative for going left, positive for going right.
 * @param {Bounds} bounds - The boundaries in whicht the fighter can move
 */
Player.prototype.move = function(direction, bounds) {
	if(this.off_time >= 0) {
		return;
	}

	this.x += direction * this.speed.x;

	if(this.x < bounds.left) {
		this.x = bounds.left;
	}
	else if (this.x + this.w > bounds.right) {
		this.x = bounds.right - this.w;
	}
};


/**
 * `Player.update` updates the player object, updating the sprite and cooldown.
 * @param {number} dt - The time delta since last update in seconds
 */
Player.prototype.update = function(dt) {
	this.sprite.update(dt);
	if(this.cooldown) {
		this.cooldown -= dt;
		if(this.cooldown < 0) {
			this.cooldown = 0;
		}
	}

	debug(1, this.lives);
	debug(2, this.off_time);

	if(this.off_time >= 0) {
		this.off_time -= dt;
		if(this.off_time < 0) {
			this.resurrect();
		}
	}

	if(this.invulnerable) {
		this.invulnerable -= dt;
		if(this.invulnerable < 0) {
			this.invulnerable = 0;
			this.choose_sprite();
		}
	}

	if(this.double_laser) {
		this.double_laser -= dt;
		if(this.double_laser < 0) {
			this.double_laser = 0;
			this.choose_sprite();
		}
	}

	if(this.rapid_fire) {
		this.rapid_fire -= dt;
		if(this.rapid_fire < 0) {
			this.rapid_fire = 0;
		}
	}
};


Player.prototype.choose_sprite = function() {
	if(this.invulnerable) {
		if(this.double_laser) {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 64, y: 140}, [{x: 0, y: 0}, {x: this.w, y: 0}, {x: this.w*2, y: 0}]);
		}
		else {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 64, y: 104}, [{x: 0, y: 0}, {x: this.w, y: 0}, {x: this.w*2, y: 0}]);
		}
	}
	else {
		if(this.double_laser) {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 140}, [{x: 0, y: 0}]);
		}
		else {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);
		}
	}
};


/**
 * `Player.make_invulnerable` makes the player invulnerable for some seconds.
 */
Player.prototype.make_invulnerable = function() {
	this.invulnerable += 7;
	this.choose_sprite();
};


/**
 * `Player.make_double_laser` gives the player a double laser for some seconds.
 */
Player.prototype.make_double_laser = function() {
	this.double_laser += 7;
	this.choose_sprite();
};


/**
 * `Player.kill` kills the player. One lives is subtracted and an explosion
 * is shown. The player will be disabled for two seconds.
 */
Player.prototype.kill = function(force=false) {
	if(!self.invulnerable || force) {
		this.lives--;
		this.off_time = 2;
		this.cooldown = 2;
		this.collidable = false;
		this.sprite = new Sprite('sprites.png', {w: 64, h: 32}, 500, {x: 124, y: 68}, [{x: 0, y: 0}, {x: 64, y: 0}]);
	}

	return null;
};


/**
 * `Player.resurrect` resurrects the player. The player gets another fighter
 * and can play again. If the player does not have lives left, it will be
 * permanently disabled. The disable check is done here and not in Player.kill,
 * so the explosion is shown in any case.
 */
Player.prototype.resurrect = function() {
	if(this.lives < 0) {
		this.off_time = Infinity;
		this.is_dead = true;
		this.h = 0;
		this.w = 0;
	}
	else {
		this.reset()
	}
};


/**
 * `Enemy` is an object for an enemy space ship/monster.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y - The initial y coordinate (from top) of the object pointing to its center
 * @param {number} type - The type of the enemy. Must be on of [0, 1, 2].
 */
function Enemy(x, y, type) {
	Entity.call(this);
	this.object = 'enemy';
	this.speed = {x: 64, y: 64}; // pixel per second
	this.bullet_speed = {x: 0, y: 300}; // pixel per second
	this.goody_speed = {x: 0, y: 64};

	switch(type) {
		case 0: {
			this.w = 32;
			this.h = 32;
			this.score_value = 30;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 300, {x: 0, y: 0}, [{x: 0, y: 0}, {x: this.w, y: 0}]);
			break;
		}
		case 1: {
			this.w = 44;
			this.h = 32;
			this.score_value = 20;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 300, {x: 68, y: 0}, [{x: 0, y: 0}, {x: this.w, y: 0}]);
			break;
		}
		case 2: {
			this.w = 48;
			this.h = 32;
			this.score_value = 10;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 300, {x: 160, y: 0}, [{x: 0, y: 0}, {x: this.w, y: 0}]);
			break;
		}
		default:
			console.warn('Unknown Enemy type received: ' + type);
	}

	this.bullet_offset = {x: this.w/2, y: 0};

	// Coordinates are generally measured from top left, not center.
	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);

	this.max_cooldown = 1;
	this.cooldown = 0;
}


/**
 * `Enemy.fire` fires a bullet if the last bullet was long enough ago (i.e. the
 * cooldown is ok).
 * @returns {Bullet|null} A Bullet object if the ship fired or null if the cooldown prevented firing.
 */
Enemy.prototype.fire = function() {
	if(this.cooldown || Math.random() < 0.999) {
		return null;
	}

	this.cooldown = this.max_cooldown;

	const type = Math.floor(Math.random() * 3) + 1; // Random number: one of [1, 2, 3]

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed, type, -1);
};


/**
 * `Enemy.update` moves the enemy, respecting boundaries, and updates the sprite.
 * @param {number} dt - The time delta since last update in seconds
 * @param {number} dx - A vector depending on direction and time delta. Negative for going left, positive for going right.
 * @param {number} dy - A vector depending on direction and time delta. Positive for going down.
 * @param {Bounds} bounds - Soft boundaries for the monster
 * @returns {boolean} Whether the object touched one of the soft borders.
 */
Enemy.prototype.update = function(dt, dx, dy, bounds) {
	this.x += dx * this.speed.x;
	this.y += dy * this.speed.y;

	if(this.cooldown) {
		this.cooldown -= dt;
		if(this.cooldown < 0) {
			this.cooldown = 0;
		}
	}

	if(this.off_time >= 0) {
		this.off_time -= dt;
		if(this.off_time < 0) {
			this.active = false;
		}
	}

	this.sprite.update(dt);

	let reached_border = ((this.x < bounds.left && dx < 0) || (this.x + this.w > bounds.right && dx > 0));

	if(this.y > bounds.bottom) {
		this.y = bounds.bottom; // TODO: Player should lose at this point
	}

	return reached_border;
};


/**
 * `Enemy.kill` kills the enemy. It turns into an explosion for some seconds.
 */
Enemy.prototype.kill = function() {
	// All enemies have the same explosion, so they have to be moved to center the explosion
	this.x += Math.floor(this.w/2 - 26);
	this.w = 52;
	this.off_time = 2;
	this.cooldown = 2;
	this.collidable = false;
	this.speed.x = 0;
	this.speed.y = 0;
	this.sprite = new Sprite('sprites.png', {w: 52, h: 32}, 0, {x: 68, y: 68}, [{x: 0, y: 0}]);

	if(Math.random() < 0.333) {
		const type = Math.floor(Math.random() * 7); // Random number: one of [0 .. 6]
		return new Goody(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.goody_speed, type);
	}

	return null;
};


/**
 * `Bullet` is an object for a bullet fired by the player or an enemy.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y - The initial y coordinate (from top) of the object pointing to its center
 * @param {number} speed - The vertical speed of the bullet in pixels per second. Positive for going downwards.
 * @param {number} type - The type of the bullet. 0 is the player's bullet, 1-3 are the enemy bullets.
 * @param {number} owner=-1 - The owner of the bullet. 0 or positive numbers refer to the respective player, negative numbers are enemy bullets (default).
 */
function Bullet(x, y, speed, type, owner=-1) {
	Entity.call(this);
	this.object = 'bullet';
	this.owner = owner;
	this.speed = speed;

	switch(type) {
		case 0: {
			this.w = 4;
			this.h = 16;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 144, y: 36}, [{x: 0, y: 0}]);
			break;
		}
		case 1: {
			this.w = 12;
			this.h = 28;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 100, {x: 0, y: 36}, [{x: 0, y: 0}, {x: this.w, y: 0}, {x: this.w*2, y: 0}, {x: this.w*3, y: 0}]);
			break;
		}
		case 2: {
			this.w = 12;
			this.h = 28;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 100, {x: 52, y: 36}, [{x: 0, y: 0}, {x: this.w, y: 0}, {x: this.w*2, y: 0}]);
			break;
		}
		case 3: {
			this.w = 12;
			this.h = 24;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 100, {x: 92, y: 36}, [{x: 0, y: 0}, {x: this.w, y: 0}, {x: this.w*2, y: 0}, {x: this.w*3, y: 0}]);
			break;
		}
		default:
			console.warn('Unknown Bullet type received: ' + type);
	}

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * `Bullet.update` moves the bullet according to its speed and updates its
 * sprite.
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - Boundaries for the bullets
 */
Bullet.prototype.update = function(dt, bounds) {
	this.sprite.update(dt);
	this.y += dt * this.speed.y;

	if(this.off_time >= 0) {
		this.off_time -= dt;
		if(this.off_time < 0) {
			this.active = false;
		}
	}

	if(this.y + this.h < bounds.top || this.y > bounds.bottom) {
		this.active = false;
	}
};


/**
 * `Bullet.kill` kills the bullet. It turns into an explosion for some seconds.
 */
Bullet.prototype.kill = function() {
	this.off_time = 2;
	this.speed.y = 0;
	this.collidable = false;
	this.sprite = new Sprite('sprites.png', {w: 12, h: 24}, 500, {x: 172, y: 36}, [{x: 0, y: 0}]);

	return null;
};


/**
 * `Goody` is an object for a goody that is released by a killed enemy.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y - The initial y coordinate (from top) of the object pointing to its center
 * @param {number} speed - The vertical speed of the goody in pixels per second. Positive for going downwards.
 * @param {number} type - The type of the goody. Currently, 0-5 are valid. These are:
 * 		0. Kill the player
 * 		1. Add one life to the player
 * 		2. Invulnerability for n seconds
 * 		3. Break-out mode!!!
 * 		4. Double laser for n seconds
 * 		5. Rapid fire for n seconds
 * 		6. Bonus points to score
 */
function Goody(x, y, speed, type) {
	Entity.call(this);
	this.object = 'goody';
	this.w = 46;
	this.h = 22;
	this.type = type;

	if(type >= 0 && type <= 6) {
		this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 260, y: 0}, [{x: 0, y: this.h*type}]);
	}
	else {
		console.warn('Unknown Goody type received: ' + type);
	}

	this.speed = speed;

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * `Goody.update` moves the goody according to its speed and updates its
 * sprite.
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - Boundaries for the goodies
 */
Goody.prototype.update = function(dt, bounds) {
	this.sprite.update(dt);
	this.y += dt * this.speed.y;

	if(this.y + this.h < bounds.top || this.y > bounds.bottom) {
		this.active = false;
	}
};


/**
 * `Wall` is an object for a wall that is a piece of a fort.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y - The initial y coordinate (from top) of the object pointing to its center
 */
function Wall(x, y) {
	Entity.call(this);
	this.object = 'wall';
	this.w = 16;
	this.h = 16;
	this.gravity = 300;

	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 152, y: 36}, [{x: 0, y: 0}]);

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * `Wall.update` moves the wall, respecting boundaries.
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - Hard boundaries for the wall piece
 */
Wall.prototype.update = function(dt, bounds) {
	// TODO: Might be cool, if the block could rotate :)

	// As long as the block is collidable, it does not move, so no update is needed
	if(this.collidable) {
		return;
	}

	this.x += dt * this.speed.x;
	this.y += dt * this.speed.y;

	// Accelerate towards the bottom
	this.speed.y += dt * this.gravity;

	if(		this.x + this.w < bounds.left ||
			this.x > bounds.right ||
			this.y > bounds.bottom) {
		this.active = false;
	}
};


/**
 * `Wall.kill` "kills" the wall. It flies out of the screen in a kind of
 * parabola.
 */
Wall.prototype.kill = function() {
	this.speed.x = Math.random() * 120 - 60; // [ -60 ..  +60]
	this.speed.y = Math.random() * -200;     // [-200 .. +200]
	this.collidable = false;

	return null;
};


export {Player, Enemy, Bullet, Goody, Wall};
