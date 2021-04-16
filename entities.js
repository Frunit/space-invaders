'use strict';

import {options} from './options.js';
import {sprite_info} from './sprite_info.js';
import {Sprite} from './sprite.js';


/**
 * <tt>Entity</tt> is an abstract object for all elements on the screen. Its
 * purpose is to ensure that certain properties are always present, no matter
 * what kind of entity it is.
 *
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
 * <tt>Player</tt> is the object for the space ship controlled by the player.
 *
 * @constructor
 * @extends Entity
 * @param {number} x
 * 		The initial x coordinate (from left) of the player pointing to its center
 * @param {number} y
 * 		The initial y coordinate (from top) of the player pointing to its center
 * @param {number} num
 * 		The number of the player (should be 0 or 1)
 */
function Player(x, y, num) {
	Entity.call(this);
	this.object = 'player';
	this.w = sprite_info.player.size.w;
	this.h = sprite_info.player.size.h;

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);

	this.speed.x = options.player_speed;

	this.bullet_offset = {x: this.w/2, y: 0};
	this.bullet_double_x_offset = 20;
	this.bullet_speed = {x: 0, y: -options.bullet_speed};

	this.sprite = new Sprite(sprite_info.player);

	this.score = 0;
	this.lives = options.start_lives;
	this.num = num;

	this.max_cooldown = options.player_cooldown;
	this.rapid_cooldown = options.player_rapid_cooldown;
	this.cooldown = 0;

	this.moving = 0;
	this.firing = false;

	this.is_dead = false;

	this.invulnerable = 0;
	this.double_laser = 0;
	this.rapid_fire = 0;
	this.speed_up = 0;
}


/**
 * <tt>Player.reset</tt> resets the player except for the position, score,
 * lives, and death status.
 */
Player.prototype.reset = function() {
	this.w = sprite_info.player.size.w;
	this.h = sprite_info.player.size.h;
	this.speed.x = options.player_speed;
	this.bullet_offset = {x: this.w/2, y: 0};
	this.bullet_double_x_offset = 20;
	this.bullet_speed = {x: 0, y: -options.bullet_speed};

	this.sprite = new Sprite(sprite_info.player);

	this.max_cooldown = options.player_cooldown;
	this.rapid_cooldown = options.player_rapid_cooldown;
	this.cooldown = 0;
	this.off_time = -1;
	this.collidable = true;

	this.moving = 0;
	this.firing = false;

	this.invulnerable = 0;
	this.double_laser = 0;
	this.rapid_fire = 0;
	this.speed_up = 0;
};


/**
 * <tt>Player.fire</tt> fires a bullet if the last bullet was long enough ago
 * (i.e. the cooldown is ok). Respects rapid_fire and double_laser.
 *
 * @returns {Bullet[]}
 * 		A list of Bullet objects if the ship fired. The list is empty if the
 * 		cooldown prevented firing.
 */
Player.prototype.fire = function() {
	if(!this.firing || this.cooldown) {
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
 * <tt>Player.move</tt> moves the player, respecting boundaries.
 *
 * @param {number} direction
 * 		A vector depending on direction and time delta. Negative for going left,
 * 		positive for going right.
 * @param {Bounds} bounds
 * 		The boundaries in whicht the player can move
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
 * <tt>Player.update</tt> updates the player object, updating the sprite and
 * cooldown.
 *
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - The boundaries in whicht the player can move
 * @returns {Bullet[]}
 * 		A list of Bullet objects if the ship fired. The list is empty if the
 * 		ship did not fire.
 */
Player.prototype.update = function(dt, bounds) {
	this.sprite.update(dt);
	if(this.cooldown) {
		this.cooldown -= dt;
		if(this.cooldown < 0) {
			this.cooldown = 0;
		}
	}

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

	if(this.speed_up) {
		this.speed_up -= dt;
		if(this.speed_up < 0) {
			this.speed_up = 0;
			this.speed.x /= 2;
		}
	}

	this.move(this.moving * dt, bounds);
	return this.fire();
};


/**
 * <tt>Player.choose_sprite</tt> chooses the right sprite for the player
 * depending on the current state (invulnerable or double laser).
 */
Player.prototype.choose_sprite = function() {
	if(this.invulnerable) {
		if(this.double_laser) {
			this.sprite = new Sprite(sprite_info.invul_double);
		}
		else {
			this.sprite = new Sprite(sprite_info.invul_single);
		}
	}
	else {
		if(this.double_laser) {
			this.sprite = new Sprite(sprite_info.double);
		}
		else {
			this.sprite = new Sprite(sprite_info.player);
		}
	}
};


/**
 * <tt>Player.apply_rapid_fire</tt> yields the player a higher firing rate for
 * some seconds.
 */
Player.prototype.apply_rapid_fire = function() {
	// If the rapid fire is new (not only prolonged), the cooldown is reduced to
	// make the effect happen instantly.
	if(this.rapid_fire === 0 && this.cooldown > this.rapid_cooldown) {
		this.cooldown -= this.max_cooldown - this.rapid_cooldown;
		if(this.cooldown < 0) {
			this.cooldown = 0;
		}
	}
	this.rapid_fire += options.goodie_time;
};


/**
 * <tt>Player.apply_speed_up</tt> allow the player to move faster for some
 * seconds.
 */
Player.prototype.apply_speed_up = function() {
	if(this.speed_up === 0) {
		this.speed.x *= 2;
	}
	this.speed_up += options.goodie_time;
};


/**
 * <tt>Player.apply_invulnerability</tt> makes the player invulnerable for some
 * seconds.
 */
Player.prototype.apply_invulnerability = function() {
	this.invulnerable += options.goodie_time;
	this.choose_sprite();
};


/**
 * <tt>Player.apply_double_laser</tt> gives the player a double laser for some
 * seconds.
 */
Player.prototype.apply_double_laser = function() {
	this.double_laser += options.goodie_time;
	this.choose_sprite();
};


/**
 * <tt>Player.kill</tt> kills the player. One live is subtracted and an
 * explosion is shown. The player will be disabled for some seconds.
 *
 * @param {boolean} [force=false]
 * 		If <tt>true</tt>, the player is killed even if invulnerable.
 * @returns {null}
 * 		To conform with the other <tt>kill</tt> functions.
 */
Player.prototype.kill = function(force=false) {
	if(!this.invulnerable || force) {
		this.lives--;
		this.off_time = options.player_kill_time;
		this.cooldown = options.player_kill_time;
		this.collidable = false;
		this.sprite = new Sprite(sprite_info.player_explode);
	}

	return null;
};


/**
 * <tt>Player.resurrect</tt> resurrects the player. The player gets another
 * fighter and can play again. If the player does not have lives left, it will
 * be permanently disabled. The disable check is done here and not in
 * Player.kill, so the explosion is shown in any case.
 */
Player.prototype.resurrect = function() {
	if(this.lives < 0) {
		this.off_time = Infinity;
		this.is_dead = true;
		this.collidable = false;
		this.h = 0;
		this.w = 0;
		this.sprite = new Sprite(sprite_info.empty);
	}
	else {
		this.reset();
	}
};


/**
 * <tt>Enemy</tt> is an object for an enemy space ship/monster.
 *
 * @constructor
 * @extends Entity
 * @param {number} x
 * 		The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y
 * 		The initial y coordinate (from top) of the object pointing to its center
 * @param {number} type
 * 		The type of the enemy. Must be on of [0, 1, 2].
 */
function Enemy(x, y, type) {
	Entity.call(this);
	this.object = 'enemy';
	this.speed = {x: options.enemy_speed, y: options.enemy_speed};
	this.bullet_speed = {x: 0, y: options.bullet_speed};
	this.goody_speed = {x: 0, y: options.goodie_speed};

	switch(type) {
		case 0: {
			this.score_value = options.scores.enemy1;
			this.sprite = new Sprite(sprite_info.enemy1);
			this.w = sprite_info.enemy1.size.w;
			this.h = sprite_info.enemy1.size.h;
			break;
		}
		case 1: {
			this.score_value = options.scores.enemy2;
			this.sprite = new Sprite(sprite_info.enemy2);
			this.w = sprite_info.enemy2.size.w;
			this.h = sprite_info.enemy2.size.h;
			break;
		}
		case 2: {
			this.score_value = options.scores.enemy3;
			this.sprite = new Sprite(sprite_info.enemy3);
			this.w = sprite_info.enemy3.size.w;
			this.h = sprite_info.enemy3.size.h;
			break;
		}
		default:
			throw 'Unknown Enemy type received: ' + type;
	}

	this.bullet_offset = {x: this.w/2, y: this.h};

	// Coordinates are generally measured from top left, not center.
	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);

	this.max_cooldown = options.enemy_cooldown;
	this.cooldown = 0;
}


/**
 * <tt>Enemy.fire</tt> fires a bullet if the last bullet was long enough ago
 * (i.e. the cooldown is ok).
 *
 * @param {number} [chance=0.001]
 * 		The chance of shooting.
 * @returns {Bullet[]}
 * 		An array of Bullet objects if the ship fired. The array may be empty.
 */
Enemy.prototype.fire = function(chance=options.enemy_fire_prob) {
	if(this.cooldown > 0 || Math.random() > chance) {
		return [];
	}

	this.cooldown = this.max_cooldown;

	const type = Math.floor(Math.random() * 3) + 1; // Random number: one of [1, 2, 3]

	return [new Bullet(
		this.x + this.bullet_offset.x,
		this.y + this.bullet_offset.y,
		this.bullet_speed,
		type,
		-1
	)];
};


/**
 * <tt>Enemy.update</tt> moves the enemy, respecting boundaries, and updates the
 * sprite.
 *
 * @param {number} dt
 * 		The time delta since last update in seconds
 * @param {number} dx
 * 		A vector depending on direction and time delta. Negative for going left,
 * 		positive for going right.
 * @param {number} dy
 * 		A vector depending on direction and time delta. Positive for going down.
 * @param {Bounds} bounds
 * 		Soft boundaries for the monster
 * @returns {boolean}
 * 		Whether the object touched one of the soft borders.
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

	const reached_border = (
		(this.x < bounds.left && dx < 0) ||
		(this.x + this.w > bounds.right && dx > 0) ||
		this.y > bounds.bottom
	);

	return reached_border;
};


/**
 * <tt>Enemy.kill</tt> kills the enemy. It turns into an explosion for some
 * seconds.
 *
 * @returns {Goody|null}
 * 		Return a goody with a chance of about 1:3, otherwise <tt>null</tt>.
 */
Enemy.prototype.kill = function() {
	// All enemies have the same explosion, so they have to be moved to center the explosion
	const new_w = sprite_info.enemy_explode.size.w;
	this.x += Math.floor(this.w - new_w);
	this.w = new_w;
	this.off_time = options.explosion_time;
	this.cooldown = options.explosion_time;
	this.collidable = false;
	this.speed.x = 0;
	this.speed.y = 0;
	this.sprite = new Sprite(sprite_info.enemy_explode);

	if(Math.random() < options.drop_chance) {
		const type = Math.floor(Math.random() * 7); // Random number: one of [0 .. 6]
		return new Goody(
			this.x + this.bullet_offset.x,
			this.y + this.bullet_offset.y,
			this.goody_speed,
			type
		);
	}

	return null;
};


/**
 * <tt>Bullet</tt> is an object for a bullet fired by the player or an enemy.
 *
 * @constructor
 * @extends Entity
 * @param {number} x
 * 		The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y
 * 		The initial y coordinate (from top) of the object pointing to its center
 * @param {number} speed
 * 		The vertical speed of the bullet in pixels per second. Positive for
 * 		going downwards.
 * @param {number} type
 * 		The type of the bullet. 0 is the player's bullet, 1-3 are the enemy
 * 		bullets.
 * @param {number} [owner=-1]
 * 		The owner of the bullet. 0 or positive numbers refer to the respective
 * 		player, negative numbers are enemy bullets.
 */
function Bullet(x, y, speed, type, owner=-1) {
	Entity.call(this);
	this.object = 'bullet';
	this.owner = owner;
	this.speed = speed;

	switch(type) {
		case 0: {
			this.sprite = new Sprite(sprite_info.player_bullet);
			this.w = sprite_info.player_bullet.size.w;
			this.h = sprite_info.player_bullet.size.h;
			break;
		}
		case 1: {
			this.sprite = new Sprite(sprite_info.bullet1);
			this.w = sprite_info.bullet1.size.w;
			this.h = sprite_info.bullet1.size.h;
			break;
		}
		case 2: {
			this.sprite = new Sprite(sprite_info.bullet2);
			this.w = sprite_info.bullet2.size.w;
			this.h = sprite_info.bullet2.size.h;
			break;
		}
		case 3: {
			this.sprite = new Sprite(sprite_info.bullet3);
			this.w = sprite_info.bullet3.size.w;
			this.h = sprite_info.bullet3.size.h;
			break;
		}
		default:
			throw 'Unknown Bullet type received: ' + type;
	}

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * <tt>Bullet.update</tt> moves the bullet according to its speed and updates
 * its sprite.
 *
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
 * <tt>Bullet.kill</tt> kills the bullet. It turns into an explosion for some
 * seconds.
 *
 * @returns {null} To conform with the other <tt>kill</tt> functions.
 */
Bullet.prototype.kill = function() {
	this.off_time = options.explosion_time;
	this.speed = {x: 0, y: 0};
	this.collidable = false;
	this.sprite = new Sprite(sprite_info.bullet_explode);

	return null;
};


/**
 * <tt>Mystery</tt> is an object for an enemy space ship/monster.
 *
 * @constructor
 * @extends Entity
 * @param {boolean} from_left
 * 		If true, the mystery enters from left, otherwise, it enters from right
 * @param {Bounds} bounds
 * 		Screen boundaries
 */
function Mystery(from_left, bounds) {
	Entity.call(this);
	this.object = 'mystery';
	// speed in pixel per second
	this.score_value = options.scores.mystery;
	this.sprite = new Sprite(sprite_info.mystery);
	this.w = sprite_info.mystery.size.w;
	this.h = sprite_info.mystery.size.h;

	if(from_left) {
		this.x = -this.w;
		this.speed.x = options.mystery_speed;
	}
	else {
		this.x = bounds.right;
		this.speed.x = -options.mystery_speed;
	}

	// The mystery will follow a sine curve. speed.y will be interpreted as
	// amplitude of the curve
	this.speed.y = 10;

	this.base_y = 45;
	this.y = this.base_y;
}


/**
 * <tt>Mystery.update</tt> moves the mystery, respecting boundaries.
 *
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - Screen boundaries
 */
Mystery.prototype.update = function(dt, bounds) {
	if(this.off_time >= 0) {
		this.off_time -= dt;
		if(this.off_time < 0) {
			this.active = false;
		}
	}
	else {
		this.x += dt * this.speed.x;
		this.y = this.speed.y * Math.sin(this.x * 0.05) + this.base_y;
		this.active = this.x + this.w >= bounds.left && this.x <= bounds.right;
	}

	this.sprite.update(dt);
};


/**
 * <tt>Mystery.kill</tt> kills the mystery. It turns into an explosion for some
 * seconds.
 *
 * @returns {null} To be compliant with other kill functions.
 */
Mystery.prototype.kill = function() {
	this.off_time = options.explosion_time;
	this.collidable = false;
	this.speed.x = 0;
	this.sprite = new Sprite(sprite_info.enemy_explode);

	const new_w = sprite_info.enemy_explode.size.w;
	const new_h = sprite_info.enemy_explode.size.h;
	this.x += this.w - new_w
	this.y += this.h - new_h
	this.w = new_w;
	this.h = new_h;

	return null;
};


/**
 * <tt>Goody</tt> is an object for a goody that is released by a killed enemy.
 *
 * @constructor
 * @extends Entity
 * @param {number} x
 * 		The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y
 * 		The initial y coordinate (from top) of the object pointing to its center
 * @param {number} speed
 * 		The vertical speed of the goody in pixels per second. Positive for going
 * 		downwards.
 * @param {number} type
 * 		The type of the goody. Currently, these are:
 * 			0. Kill the player
 * 			1. Add one life to the player
 * 			2. Invulnerability for n seconds
 * 			3. Break-out mode!!!
 * 			4. Double laser for n seconds
 * 			5. Rapid fire for n seconds
 * 			6. Bonus points to score
 */
function Goody(x, y, speed, type) {
	Entity.call(this);
	this.object = 'goody';
	this.type = type;

	if(type >= 0 && type <= 6) {
		this.sprite = new Sprite(sprite_info.goodies[type]);
		this.w = sprite_info.goodies[type].size.w;
		this.h = sprite_info.goodies[type].size.h;
	}
	else {
		throw 'Unknown Goody type received: ' + type;
	}

	this.speed = speed;

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * <tt>Goody.update</tt> moves the goody according to its speed and updates its
 * sprite.
 *
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
 * <tt>Wall</tt> is an object for a wall that is a piece of a fort.
 *
 * @constructor
 * @extends Entity
 * @param {number} x
 * 		The initial x coordinate (from left) of the object pointing to its center
 * @param {number} y
 * 		The initial y coordinate (from top) of the object pointing to its center
 */
function Wall(x, y) {
	Entity.call(this);
	this.object = 'wall';
	this.gravity = 300;

	this.sprite = new Sprite(sprite_info.wall);
	this.w = sprite_info.wall.size.w;
	this.h = sprite_info.wall.size.h;

	this.x = Math.floor(x - this.w/2);
	this.y = Math.floor(y - this.h/2);
}


/**
 * <tt>Wall.update</tt> moves the wall, respecting boundaries.
 *
 * @param {number} dt - The time delta since last update in seconds
 * @param {Bounds} bounds - Hard boundaries for the wall piece
 */
Wall.prototype.update = function(dt, bounds) {
	// MAYBE: Might be cool, if the block could rotate :)

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
 * <tt>Wall.kill</tt> "kills" the wall. It flies out of the screen in a kind of
 * parabola.
 *
 * @returns {null} To conform with the other <tt>kill</tt> functions.
 */
Wall.prototype.kill = function() {
	this.speed.x = Math.random() * 120 - 60; // [ -60 .. +60]
	this.speed.y = Math.random() * -200;     // [-200 ..   0]
	this.collidable = false;

	return null;
};


export {Player, Enemy, Bullet, Goody, Wall, Mystery};
