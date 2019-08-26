'use strict';


/**
 * `Engine` is the actual game engine. It *should* work without any gui, making
 * it more easily testable.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} window_border - The border width in pixels
 */
export function Engine(window_size, border) {
	// These variables store all objects in the game.
	this.enemies = [];
	this.enemy_bullets = [];
	this.player = null;
	this.player_bullets = [];

	// Some status variables that are valid for all enemies (since enemies move
	// in a synchronized way.
	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	this.outer_bounds = {
		left: 0,
		right: window_size.w,
		top: 0,
		bottom: window_size.h,
	};

	this.inner_bounds = {
		left: border,
		right: window_size.w - border,
		top: border,
		bottom: window_size.h - border,
	};
}


/**
 * `Engine.setup` initializes the game with the player and enemies.
 */
Engine.prototype.setup = function() {
	// TODO: Consider, whether this could be part of the constructor.
	this.enemies = [];
	this.enemy_bullets = [];
	this.player = new Player(this.outer_bounds.right/2, this.inner_bounds.bottom);
	this.player_bullets = [];

	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	// Create enemies
	for(let y = 0; y < 5; y++) {
		for(let x = 0; x < 8; x++) {
			const type = Math.ceil(y / 2); // 0, 1, 1, 2, 2, ...
			this.enemies.push(new Enemy(x*50+50, y*50+10, type));
		}
	}
};


/**
 * `Engine.handle_input` handles player input.
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.handle_input = function(dt) {
	if(input.is_down('LEFT')) {
		this.player.move(dt * -1, this.inner_bounds);
	}
	else if(input.is_down('RIGHT')) {
		this.player.move(dt, this.inner_bounds);
	}

	if(input.is_down('SPACE')) {
		const bullet = this.player.fire();
		if(bullet !== null) {
			this.player_bullets.push(bullet);
		}
	}
}


/**
 * `Engine.update` updates all objects in the game.
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.update = function(dt) {
	this.player.update(dt);

	if(this.enemy_moves_down) {
		for(let enemy of this.enemies) {
			enemy.update(dt, 0, dt * this.enemy_speed_factor, this.inner_bounds);
		}
		this.enemy_moves_down--;
	}
	else {
		let reached_boundary = false;
		const dir = this.enemy_direction * dt * this.enemy_speed_factor;

		for(let enemy of this.enemies) {
			reached_boundary = enemy.update(dt, dir, 0, this.inner_bounds) || reached_boundary;
		}

		if(reached_boundary) {
			this.enemy_moves_down = 10;
			this.enemy_direction *= -1;
			this.enemy_speed_factor += 0.05
		}
	}

	for(let bullet of this.enemy_bullets) {
		bullet.update(dt, this.outer_bounds);
	}

	for(let bullet of this.player_bullets) {
		bullet.update(dt, this.outer_bounds);
	}

	this.player_bullets = this.player_bullets.filter(bullet => bullet.active);
	this.enemy_bullets = this.enemy_bullets.filter(bullet => bullet.active);

	// TODO: Would be nice with some cool effect upon exploding!

	this.collide(this.player_bullets, this.enemy_bullets);
	this.collide(this.player_bullets, this.enemies);
	this.collide(this.enemy_bullets, [this.player]);
};


/**
 * `Engine.collide` compares all entities of the first list with all entities of
 * the second list and tests if they collide. If so, the elements are removed
 * from the arrays in place.
 * @param {Object[]} array1 - The first array of entities
 * @param {Object[]} array2 - The second array of entities
 */
Engine.prototype.collide = function(array1, array2) {
	const colliding1 = [];
	const colliding2 = [];

	/**
	 * `collider` checks if the bounding boxes of a and b overlap.
	 * @param {Object} a - The first object
	 * @param {Object} b - The second object
	 * @returns {boolean} Whether or not the bounding boxes overlap.
	 */
	const collider = function(a, b) {
		// TODO: If the bounding boxes hit, this should continue doing some kind of pixel-perfect detection, at least for forts.
		return !(
			a.x       > b.x + b.w ||
			a.y       > b.y + b.h ||
			a.x + a.w < b.x       ||
			a.y + a.h < b.y
		);
	};


	/**
	 * `remove_multiple_elements` removes all elements from array with the
	 * indices given in to_remove in place. to_remove must be sorted!
	 * @param {Array} array - The array to change
	 * @param {number[]} to_remove - The list of indices to remove from array
	 */
	const remove_multiple_elements = function(array, to_remove) {
		for(let i = to_remove.length -1; i >= 0; i--)
			array.splice(to_remove[i],1);
	};


	for(let i = 0; i < array1.length; i++) {
		for(let j = 0; j < array2.length; j++) {
			const ent1 = array1[i];
			const ent2 = array2[j];

			if(collider(ent1, ent2)) {
				colliding1.push(i);
				colliding2.push(j);
			}
		}
	}

	remove_multiple_elements(array1, colliding1);
	remove_multiple_elements(array2, colliding2);
};


/**
 * `Engine.get_entities` returns all entities in the game for the gui to draw.
 * @returns {Object[]} An array with all entities (player, enemies, bullets)
 */
Engine.prototype.get_entities = function() {
	return [this.player].concat(this.enemies, this.enemy_bullets, this.player_bullets);
};


/**
 * @typedef {Object} Bounds
 * @property {number} top    - The uppermost pixel
 * @property {number} right  - The rightmost pixel
 * @property {number} left   - The leftmost pixel
 * @property {number} bottom - The lowermost pixel
 */
