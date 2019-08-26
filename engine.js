'use strict';

import {Player, Enemy, Wall} from './entities.js';
// TODO: Sprites could be created only in entities.js, removing this import
import {Sprite} from './sprite.js';

/**
 * `Engine` is the actual game engine. It *should* work without any gui, making
 * it more easily testable.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} window_border - The border width in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 * @param {Level[]} levels - The available levels
 */
export function Engine(window_size, border, num_players, levels) {
	// These variables store all objects in the game.
	this.enemies = [];
	this.enemy_bullets = [];
	this.players = [];
	this.player_bullets = [];
	this.walls = [];
	this.goodies = [];

	// Some status variables that are valid for all enemies (since enemies move
	// in a synchronized way.
	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	this.level_list = levels;
	this.level = 0;

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
 * `Engine.next_level` loads the next level.
 */
Engine.prototype.next_level = function() {
	this.level++;
	const current = this.level_list[this.level % this.level_list.length];
	const recurrence = Math.floor(this.level / this.level_list.length);
	this.setup(current, recurrence, false);
};


/**
 * `Engine.setup` initializes the game with the player and enemies.
 * @param {Level} level=null - The level to set up. If no level is given, the first level will be used.
 * @param {number} recurrence=0 - How often was this level played (0 for first time, 1 for second time, ...)
 * @param {boolean} fresh=false - If true, forces new player objects (instead of using the existing ones). If no player objects are present, they are created in any case.
 */
Engine.prototype.setup = function(level=null, recurrence=0, fresh=false) {
	this.enemies = [];
	this.enemy_bullets = [];
	this.player_bullets = [];
	this.walls = [];
	this.goodies = [];

	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1 + recurrence * 0.33;

	if(fresh) {
		this.players = [];
	}

	if(this.players.length) {
		// Reset players
		for(let i = 0; i < this.num_players; i++) {
			this.players[i].reset();
			this.players[i] = (this.outer_bounds.right * (i+1))/(this.num_players + 1)
		}
	}
	else {
		// Create players
		for(let i = 0; i < this.num_players; i++) {
			this.players.push(new Player((this.outer_bounds.right * (i+1))/(this.num_players + 1), this.inner_bounds.bottom - 20));
		}
	}

	if(level === null) {
		level = this.level_list[0];
	}

	// Create enemies
	// TODO: Positioning should happen according to the size of the enemy block!
	for(let y = 0; y < level.enemies.length; y++) {
		for(let x = 0; x < level.enemies[0].length; x++) {
			let type = level.enemies[y][x];
			if(type === '_') {
				continue;
			}

			this.enemies.push(new Enemy(x*50+50, y*50+10, +type));
		}
	}

	// Create forts
	// TODO: Positioning should happen according to the size and number of forts!
	for(let i = 0; i < level.forts; i++) {
		for(let y = 0; y < level.fort.length; y++) {
			for(let x = 0; x < level.fort[0].length; x++) {
				if(level.fort[y][x] === 'X') {
					this.walls.push(
						new Wall(
							i * 200 + 100 + x * 16, // x position
							450 + y * 16            // y position
						)
					);
				}
			}
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
			const bullets = this.players[0].fire();
			this.player_bullets.push(...bullets);
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
			const bullets = this.players[0].fire();
			this.player_bullets.push(...bullets);
		}

		if(input.is_down('CTRL') ||
				input.is_down('UP1')) {
			const bullets = this.players[0].fire();
			this.player_bullets.push(...bullets);
		}
	}
}


/**
 * `Engine.update` updates all objects in the game.
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.update = function(dt) {
	for(let player of this.players) {
		if(player.is_dead) {
			continue;
		}
		player.update(dt);
		if(player.off_time >= 0) {
			player.off_time -= dt;
			if(player.off_time < 0) {
				this.resurrect(player);
			}
		}
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

	for(let goody of this.goodies) {
		goody.update(dt, this.outer_bounds);
	}

	// Remove bullets and goodies that left the screen
	this.player_bullets = this.player_bullets.filter(bullet => bullet.active);
	this.enemy_bullets = this.enemy_bullets.filter(bullet => bullet.active);
	this.goodies = this.goodies.filter(goody => goody.active);

	// TODO: Would be nice with some cool effect upon exploding!

	this.collide(this.player_bullets, this.enemy_bullets);
	this.collide(this.player_bullets, this.enemies);
	this.collide(this.enemy_bullets, this.players);
	this.collide(this.player_bullets, this.walls);
	this.collide(this.enemy_bullets, this.walls);
	this.collide(this.goodies, this.players);
};


/**
 * `Engine.collide` compares all entities of the first list with all entities of
 * the second list and tests if they collide. If so, the elements are removed
 * from the arrays in place.
 * @param {Object[]} bullets - The first array of entities. Bullets or Goodies
 * @param {Object[]} others - The second array of entities. Bullets, Enemies, or Players
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

				if(bullet.object === 'goody') {
					this.apply_goody(bullet.type, other);
				}

				else if(bullet.owner >= 0) {
					this.players[bullet.owner].score += other.score;
				}

				else if(other.object === 'player') {
					this.kill(other);
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
 * `Engine.apply_goody` applies a goody to a player. Depending on the goody, the
 * player gets an advantage (or maybe also a disadvantage).
 * @param {number} type - The type of the goody.
 * @param {Player} player - The player to apply the goody on.
 */
Engine.prototype.apply_goody = function(type, player) {
	switch(type) {
		case 0: {
			this.kill(player);
			break;
		}
		case 1: {
			player.lives++;
			break;
		}
		case 2: {
			this.make_invulnerable(player);
			break;
		}
		case 3: {
			this.start_break_out(player);
			break;
		}
		case 4: {
			this.make_double_laser(player);
			break;
		}
		case 5: {
			player.rapid_fire += 7;
			break;
		}
		case 6: {
			player.score += 500;
			break;
		}
		default:
			console.warn('Unknown Goody type received: ' + type);
	}
};


Engine.prototype.make_invulnerable = function(player) {
	player.invulnerable += 7;
	player.sprite = new Sprite('sprites.png', {w: player.w, h: player.h}, 0, {x: 64, y: 100}, [{x: 0, y: 0}, {x: player.w, y: 0}]);
};


Engine.prototype.start_break_out = function(player) {
	// TODO: Add Break-out mode!
};


Engine.prototype.make_double_laser = function(player) {
	player.double_laser += 7;
	player.sprite = new Sprite('sprites.png', {w: player.w, h: player.h}, 0, {x: 188, y: 136}, [{x: 0, y: 0}]);
};


/**
 * `Engine.kill` kills the given player. One lives is subtracted and an
 * explosion is shown.
 * @param {Player} player - The player that shall be killed.
 */
Engine.prototype.kill = function(player) {
	player.lives--;
	player.off_time = 2;
	player.sprite = new Sprite('sprites.png', {w: 64, h: 32}, 500, {x: 56, y: 136}, [{x: 0, y: 0}, {x: 64, y: 0}]);
};


/**
 * `Engine.resurrect` resurrects the given player. The player gets another
 * fighter and can play again. If the player does not have lives left, it will
 * be permanently disabled.
 * @param {Player} player - The player that shall be resurrected.
 */
Engine.prototype.resurrect = function(player) {
	if(player.lives < 0) {
		player.off_time = Infinity;
		player.is_dead = true;
		player.h = 0;
		player.w = 0;
		this.test_game_over();
	}
	else {
		player.off_time = -1;
		player.x = this.outer_bounds.right/2;
		player.sprite = new Sprite('sprites.png', {w: player.w, h: player.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);
	}
};


/**
 * `Engine.test_game_over` tests whether the game is over, i.e. all players are
 * dead. If so, Engine#game_over is invoked.
 */
Engine.prototype.test_game_over = function() {
	for(let player of this.players) {
		if(!player.is_dead) {
			return;
		}
	}

	this.game_over();
};


/**
 * `Engine.game_over` does not do anything, yet. Shall later show high score.
 */
Engine.prototype.game_over = function() {
	// TODO: Do the game over! Show high score.
};


/**
 * `Engine.get_entities` returns all entities in the game for the gui to draw.
 * @returns {Object[]} An array with all entities (players, enemies, bullets)
 */
Engine.prototype.get_entities = function() {
	return this.players.concat(this.enemies, this.enemy_bullets, this.player_bullets, this.walls, this.goodies);
};


/**
 * @typedef {Object} Bounds
 * @property {number} top    - The uppermost pixel
 * @property {number} right  - The rightmost pixel
 * @property {number} left   - The leftmost pixel
 * @property {number} bottom - The lowermost pixel
 */
