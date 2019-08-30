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
 */
export function Player(x, y) {
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
				0
			)
		);
		bullets.push(
			new Bullet(
				this.x + this.bullet_offset.x + this.bullet_double_x_offset,
				this.y + this.bullet_offset.y,
				this.bullet_speed,
				0,
				0
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
				0
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
	};

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

	if(this.off_time >= 0) {
		this.off_time -= dt;
	}

	if(this.invulnerable) {
		this.invulnerable -= dt;
		if(this.invulnerable < 0) {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);
			this.invulnerable = 0;
		}
	}

	if(this.double_laser) {
		this.double_laser -= dt;
		if(this.double_laser < 0) {
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);
			this.double_laser = 0;
		}
	}

	if(this.rapid_fire) {
		this.rapid_fire -= dt;
		if(this.rapid_fire < 0) {
			this.rapid_fire = 0;
		}
	}
};


/**
 * `Player.make_invulnerable` makes the player invulnerable for some seconds.
 */
Player.prototype.make_invulnerable = function() {
	this.invulnerable += 7;
	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 64, y: 100}, [{x: 0, y: 0}, {x: this.w, y: 0}]);
};


// TODO: Need sprite for invulnerable + double laser (or need to combine sprites)
/**
 * `Player.make_double_laser` gives the player a double laser for some seconds.
 */
Player.prototype.make_double_laser = function() {
	this.double_laser += 7;
	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 188, y: 136}, [{x: 0, y: 0}]);
};


/**
 * `Player.kill` kills the player. One lives is subtracted and an explosion
 * is shown. The player will be disabled for two seconds.
 */
Player.prototype.kill = function() {
	this.lives--;
	this.off_time = 2;
	this.cooldown = 2;
	this.collidable = false;
	this.sprite = new Sprite('sprites.png', {w: 64, h: 32}, 500, {x: 56, y: 136}, [{x: 0, y: 0}, {x: 64, y: 0}]);
};


/**
 * `Player.resurrect` resurrects the player. The player gets another fighter
 * and can play again. If the player does not have lives left, it will be
 * permanently disabled. The disable check is done here and not in Player.kill,
 * so the explosion is shown in any case.
 */
Player.prototype.resurrect = function() {
	if(player.lives < 0) {
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
export function Enemy(x, y, type) {
	// TODO: Enemies should shoot! Otherwise, the game might be a little bit too easy ;)
	Entity.call(this);
	this.object = 'enemy';
	this.speed = {x: 64, y: 64}; // pixel per second
	this.bullet_speed = 300; // pixel per second

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
	if(this.cooldown) {
		return null;
	}

	this.cooldown = this.max_cooldown;

	const type = Math.floor(Math.random() * 3) + 1; // Random number: one of [1, 2, 3]

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed, type);
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
	this.off_time = 2;
	this.cooldown = 2;
	this.collidable = false;
	this.speed.x = 0;
	this.speed.y = 0;
	// TODO: This needs the right explosion sprite.
	this.sprite = new Sprite('sprites.png', {w: 64, h: 32}, 500, {x: 56, y: 136}, [{x: 0, y: 0}, {x: 64, y: 0}]);
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
export function Bullet(x, y, speed, type, owner=-1) {
	Entity.call(this);
	this.object = 'bullet';
	this.owner = owner;
	this.speed.y = speed;

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
	this.y += dt * this.speed;

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
	// TODO: This needs the right explosion sprite.
	this.sprite = new Sprite('sprites.png', {w: 64, h: 32}, 500, {x: 56, y: 136}, [{x: 0, y: 0}, {x: 64, y: 0}]);
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
export function Goody(x, y, speed, type) {
	Entity.call(this);
	this.object = 'goody';
	this.w = 46;
	this.h = 22;
	this.type = type;

	if(type >= 0 && type < 6) {
		this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 260, y: 0}, [{x: 0, y: this.h*type}]);
	}
	else {
		console.warn('Unknown Goody type received: ' + type);
	}

	this.speed.y = speed;

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
	this.y += dt * this.speed;

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
export function Wall(x, y) {
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
	};

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
	this.speed.x = Math.random() * 60 - 30;  // [-30 ..  +30]
	this.speed.y = Math.random() * 200;      // [  0 .. +200]
	this.collidable = false;
};
