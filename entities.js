'use strict';


/**
 * `Player` is the object for the space ship controlled by the player.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the player
 * @param {number} y - The initial y coordinate (from top) of the player
 */
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


/**
 * `Player.fire` fires a bullet if the last bullet was long enough ago (i.e. the
 * cooldown is ok).
 * @returns {Bullet|null} A Bullet object if the ship fired or null if the cooldown prevented firing.
 */
Player.prototype.fire = function() {
	if(this.cooldown) {
		return null;
	}

	this.cooldown = this.max_cooldown;

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed);
};


/**
 * `Player.move` moves the player, respecting boundaries.
 * @param {number} direction - A vector depending on direction and time delta. Negative for going left, positive for going right.
 * @param {Bounds} bounds - The boundaries in whicht the fighter can move
 */
Player.prototype.move = function(direction, bounds) {
	this.x += direction * this.speed;

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
};


/**
 * `Enemy` is an object for an enemy space ship/monster.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object
 * @param {number} y - The initial y coordinate (from top) of the object
 * @param {number} type - The type of the enemy. Must be on of [0, 1, 2].
 */
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

	return new Bullet(this.x + this.bullet_offset.x, this.y + this.bullet_offset.y, this.bullet_speed);
};


/**
 * `Enemy.update` moves the enemy, respecting boundaries, and updates the sprite.
 * @param {number} dx - A vector depending on direction and time delta. Negative for going left, positive for going right.
 * @param {number} dy - A vector depending on direction and time delta. Positive for going down.
 * @param {Bounds} bounds - Soft boundaries for the monster
 * @returns {boolean} Whether the object touched one of the soft borders.
 */
Enemy.prototype.update = function(dx, dy, bounds) {
	this.x += dx * this.speed.x;
	this.y += dy * this.speed.y;

	this.sprite.update(dt);

	let reached_border = (this.x < bounds.left || this.x + this.w > bounds.right);

	if(this.y > bounds.bottom) {
		this.y = bounds.bottom; // TODO: Player should lose at this point
	}

	return reached_border;
};


/**
 * `Bullet` is an object for a bullet fired by the player or an enemy.
 * @constructor
 * @param {number} x - The initial x coordinate (from left) of the object
 * @param {number} y - The initial y coordinate (from top) of the object
 * @param {number} speed - The vertical speed of the bullet in pixels per second. Positive for going downwards.
 */
function Bullet(x, y, speed) {
	// TODO: The bullets for enemies and the player should look differently
	this.x = x;
	this.y = y;
	this.w = 12;
	this.h = 20;
	this.active = true;
	this.speed = speed;
	this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 5, {x: 0, y: 156}, [{x: 0, y: 0}, {x: 12, y: 0}, {x: 24, y: 0}]);
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

	if(this.y + this.h < bounds.top || this.y > bounds.bottom) {
		this.active = false;
	}
};
