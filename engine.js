'use strict';


/**
 * `Engine` is the actual game engine. It *should* work without any gui, making
 * it more easily testable.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} window_border - The border width in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 */
export function Engine(window_size, border, num_players) {
	// These variables store all objects in the game.
	this.enemies = [];
	this.enemy_bullets = [];
	this.players = [];
	this.player_bullets = [];

	// Some status variables that are valid for all enemies (since enemies move
	// in a synchronized way.
	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	this.num_players = num_players;

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
	this.players = [];
	this.player_bullets = [];

	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	// Create players
	for(let i = 0; i < this.num_players; i++) {
		this.players.push(new Player((this.outer_bounds.right * (i+1))/(this.num_players + 1), this.inner_bounds.bottom));
	}

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
	if(this.num_players === 1) {
		if(input.is_down('LEFT0') ||
				input.is_down('LEFT1')) {
			this.players[0].move(dt * -1, this.inner_bounds);
		}
		else if(input.is_down('RIGHT0') ||
				input.is_down('RIGHT1')) {
			this.players[0].move(dt, this.inner_bounds);
		}

		if(input.is_down('SPACE') ||
				input.is_down('CTRL') ||
				input.is_down('SHIFT') ||
				input.is_down('UP0') ||
				input.is_down('UP1')) {
			const bullet = this.players[0].fire();
			if(bullet !== null) {
				this.player_bullets.push(bullet);
			}
		}
	}
	else {
		if(input.is_down('LEFT0')) {
			this.players[0].move(dt * -1, this.inner_bounds);
		}
		else if(input.is_down('RIGHT0')) {
			this.players[0].move(dt, this.inner_bounds);
		}

		if(input.is_down('LEFT1')) {
			this.players[1].move(dt * -1, this.inner_bounds);
		}
		else if(input.is_down('RIGHT1')) {
			this.players[1].move(dt, this.inner_bounds);
		}

		if(input.is_down('SHIFT') ||
				input.is_down('UP0')) {
			const bullet = this.players[0].fire();
			if(bullet !== null) {
				this.player_bullets.push(bullet);
			}
		}

		if(input.is_down('CTRL') ||
				input.is_down('UP1')) {
			const bullet = this.players[1].fire();
			if(bullet !== null) {
				this.player_bullets.push(bullet);
			}
		}
	}
}


/**
 * `Engine.update` updates all objects in the game.
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.update = function(dt) {
	for(let player of this.players) {
		player.update(dt);
	}

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

	// Remove bullets that left the screen
	this.player_bullets = this.player_bullets.filter(bullet => bullet.active);
	this.enemy_bullets = this.enemy_bullets.filter(bullet => bullet.active);

	// TODO: Would be nice with some cool effect upon exploding!

	this.collide(this.player_bullets, this.enemy_bullets);
	this.collide(this.player_bullets, this.enemies);
	this.collide(this.enemy_bullets, this.players);
};


/**
 * `Engine.collide` compares all entities of the first list with all entities of
 * the second list and tests if they collide. If so, the elements are removed
 * from the arrays in place.
 * @param {Bullet[]} bullets - The first array of entities
 * @param {Object[]} others - The second array of entities. Bullets, Enemies, ...
 */
Engine.prototype.collide = function(bullets, others) {
	const colliding_bullets = [];
	const colliding_others = [];

	for(let i = 0; i < bullets.length; i++) {
		for(let j = 0; j < others.length; j++) {
			const bullet = bullets[i];
			const other = others[j];

			if(this.collider(bullet, other)) {
				colliding_bullets.push(i);
				colliding_others.push(j);

				if(bullet.owner >= 0) {
					this.players[bullet_owner].score += other.score;
				}
				break;
			}
		}
	}

	this.remove_multiple_elements(bullets, colliding_bullets);
	this.remove_multiple_elements(others, colliding_others);
};


/**
 * `Engine.collider` checks if the bounding boxes of a and b overlap.
 * @param {Object} a - The first object
 * @param {Object} b - The second object
 * @returns {boolean} Whether or not the bounding boxes overlap.
 */
Engine.prototype.collider = function(a, b) {
	// TODO: If the bounding boxes hit, this might continue doing some kind of pixel-perfect detection.
	return !(
		a.x       > b.x + b.w ||
		a.y       > b.y + b.h ||
		a.x + a.w < b.x       ||
		a.y + a.h < b.y
	);
};


/**
 * `Engine.remove_multiple_elements` removes all elements from array with the
 * indices given in to_remove in place. to_remove must be sorted!
 * @param {Array} array - The array to change
 * @param {number[]} to_remove - The list of indices to remove from array
 */
Engine.prototype.remove_multiple_elements = function(array, to_remove) {
	for(let i = to_remove.length -1; i >= 0; i--)
		array.splice(to_remove[i],1);
};


/**
 * `Engine.get_entities` returns all entities in the game for the gui to draw.
 * @returns {Object[]} An array with all entities (players, enemies, bullets)
 */
Engine.prototype.get_entities = function() {
	return this.players.concat(this.enemies, this.enemy_bullets, this.player_bullets);
};


/**
 * @typedef {Object} Bounds
 * @property {number} top    - The uppermost pixel
 * @property {number} right  - The rightmost pixel
 * @property {number} left   - The leftmost pixel
 * @property {number} bottom - The lowermost pixel
 */
