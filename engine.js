'use strict';

import {Player, Enemy, Wall} from './entities.js';
import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


/**
 * `Engine` is the actual game engine. It *should* work without any screen,
 * making, it more easily testable.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} window_border - The border width in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 * @param {Level[]} levels - The available levels
 * @param {number} level - The level to start at
 */
function Engine(window_size, border, num_players, levels, level) {
	// These variables store all objects in the game.
	this.enemies = [];
	this.enemy_bullets = [];
	this.players = [];
	this.player_bullets = [];
	this.walls = [];
	this.goodies = [];
	this.gui = [];
	this.texts = [];

	// Some status variables that are valid for all enemies (since enemies move
	// in a synchronized way.
	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;

	this.game_is_over = false;

	this.level_list = levels;
	this.level = level;

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


// TODO: Engine.setup is too long. Especially level setup and GUI setup should be put into another function
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
	this.gui = [];
	this.texts = [];

	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1 + recurrence * 0.33;

	this.game_is_over = false;

	// Players

	if(fresh) {
		this.players = [];
	}

	// TODO: Bounds calculation assumes that left bound is zero. This is not guaranteed!
	if(this.players.length) {
		// Reset players
		for(let i = 0; i < this.num_players; i++) {
			this.players[i].reset();
			this.players[i].x = (this.outer_bounds.right * (i+1))/(this.num_players + 1);
		}
	}
	else {
		// Create players
		for(let i = 0; i < this.num_players; i++) {
			this.players.push(new Player((this.outer_bounds.right * (i+1))/(this.num_players + 1), this.inner_bounds.bottom - 20, i));
		}
	}

	// GUI

	this.gui.push(new GUI_Element(this.outer_bounds.left + 5, this.outer_bounds.top + 5, 'life'));
	const life_width = this.gui[this.gui.length - 1].w;

	this.texts.push(new Text('', this.outer_bounds.left + 10 + life_width, this.outer_bounds.top + 5, Infinity));
	this.texts[this.texts.length-1].set_score(this.players[0].score);

	if(this.num_players === 2) {
		this.gui.push(new GUI_Element(this.outer_bounds.right - 5 - life_width, this.outer_bounds.top + 5, 'life'));

		this.texts.push(new Text('', this.outer_bounds.right - 10 - life_width, this.outer_bounds.top + 5, Infinity, 'right'));
		this.texts[this.texts.length-1].set_score(this.players[1].score);
	}

	this.texts.push(new Text('Level ', (this.outer_bounds.right + this.outer_bounds.left)/2, this.outer_bounds.top + 5, Infinity, 'right'));
	this.texts.push(new Text(String(this.level), (this.outer_bounds.right + this.outer_bounds.left)/2, this.outer_bounds.top + 5, Infinity));

	// Level

	if(level === null) {
		level = this.level_list[0];
	}

	// Create enemies
	const enemy_offset = this.inner_bounds.left + (this.inner_bounds.right - this.inner_bounds.left) / 2 - level.enemies[0].length / 2 * 60;
	const enemy_upper = 30;

	for(let y = 0; y < level.enemies.length; y++) {
		for(let x = 0; x < level.enemies[0].length; x++) {
			let type = level.enemies[y][x];
			if(type === '_') {
				continue;
			}

			this.enemies.push(
				new Enemy(
					enemy_offset + x * 60,
					enemy_upper + y * 50,
					+type
				)
			);
		}
	}

	// Create forts
	const fort_x_dist = (this.inner_bounds.right - this.inner_bounds.left) / (level.forts + 1);
	const fort_offset = this.inner_bounds.left + fort_x_dist - level.fort[0].length / 2 * 16;
	const fort_upper = 530 - level.fort.length * 16;

	for(let i = 0; i < level.forts; i++) {
		for(let y = 0; y < level.fort.length; y++) {
			for(let x = 0; x < level.fort[0].length; x++) {
				if(level.fort[y][x] === 'X') {
					this.walls.push(
						new Wall(
							fort_offset + i * fort_x_dist + x * 16, // x position
							fort_upper + y * 16                     // y position
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
 * @returns {Object|null} If the game is over, this returns an object with the next stage, score(s), and level. Otherwise, null is returned.
 */
Engine.prototype.update = function(dt) {
	let living_players = 0;
	for(let player of this.players) {
		if(player.is_dead) {
			continue;
		}
		living_players++;
		player.update(dt);
	}

	if(living_players === 0) {
		this.game_is_over = true;
	}

	if(this.game_is_over) {
		const score = []
		for(let player of this.players) {
			score.push(player.score);
		}

		return {
			next_stage: 'highscore',
			scores: score,
			level: this.level,
		};
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

	for(let enemy of this.enemies) {
		const bullet = enemy.fire();
		if(bullet !== null) {
			this.enemy_bullets.push(bullet);
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

	for(let wall of this.walls) {
		wall.update(dt, this.outer_bounds);
	}

	for(let text of this.texts) {
		text.update(dt);
	}

	// Remove entities that are inactive. They may have either left the screen
	// or their explosion is finished.
	this.player_bullets = this.player_bullets.filter(bullet => bullet.active);
	this.enemy_bullets = this.enemy_bullets.filter(bullet => bullet.active);
	this.goodies = this.goodies.filter(goody => goody.active);
	this.walls = this.walls.filter(wall => wall.active);
	this.enemies = this.enemies.filter(enemy => enemy.active);
	this.texts = this.texts.filter(text => text.active);

	this.collide_bullets(this.player_bullets, this.enemy_bullets);
	this.collide_bullets(this.player_bullets, this.enemies);
	this.collide_bullets(this.enemy_bullets, this.players);
	this.collide_bullets(this.player_bullets, this.walls);
	this.collide_bullets(this.enemy_bullets, this.walls);
	this.collide_goodies(this.goodies, this.players);

	if(this.enemies.length === 0) {
		this.next_level();
	}

	return null;
};


Engine.prototype.collide_all = function(a, b) {
	const colliding = [];

	for(let i = 0; i < a.length; i++) {
		for(let j = 0; j < b.length; j++) {
			if(this.collider(a[i], b[j])) {
				colliding.push([i, j]);
				break;
			}
		}
	}

	return colliding;
};


/**
 * `Engine.collide_bullets` compares all bullets of the first list with all
 * entities of the second list and tests if they collide. If so, depending on
 * the target, effects happen.
 * @param {Bullet[]} bullets - The first array of entities. Bullets or Goodies
 * @param {Entity[]} others - The second array of entities. Bullets, Enemies, Players, or Walls
 */
Engine.prototype.collide_bullets = function(bullets, others) {
	const colliding = this.collide_all(bullets, others);

	for(let [a, b] of colliding) {
		const bullet = bullets[a];
		const other = others[b];

		if(bullet.owner >= 0) {
			this.players[bullet.owner].score += other.score_value;
		}

		// Initiate specific "killing" animation
		const goody = other.kill();
		if(goody !== null) {
			this.goodies.push(goody);
		}
	}

	this.remove_multiple_elements(bullets, colliding.map(x => x[0]));
};


/**
 * `Engine.collide_goodies` compares all goodies of the first list with all
 * players of the second list and tests if they collide. If so, the goody is
 * applied on the player.
 * @param {Goody[]} goodies - An array of goodies
 * @param {Player[]} players - An array of players
 */
Engine.prototype.collide_goodies = function(goodies, players) {
	const colliding = this.collide_all(goodies, players);

	for(let [a, b] of colliding) {
		this.apply_goody(goodies[a].type, players[b]);
	}

	this.remove_multiple_elements(goodies, colliding.map(x => x[0]));
};


/**
 * `Engine.collider` checks if the bounding boxes of a and b overlap.
 * @param {Entity} a - The first object
 * @param {Entity} b - The second object
 * @returns {boolean} Whether or not the bounding boxes overlap.
 */
Engine.prototype.collider = function(a, b) {
	// TODO: If the bounding boxes hit, this might continue doing some kind of pixel-perfect detection.
	return a.collidable && b. collidable && !(
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
			player.kill();
			break;
		}
		case 1: {
			player.lives++;
			break;
		}
		case 2: {
			player.make_invulnerable();
			break;
		}
		case 3: {
			this.start_break_out();
			break;
		}
		case 4: {
			player.make_double_laser();
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


/**
 * `Engine.start_break_out` puts a ball on the player's fighter that will start
 * right away upwards.
 * @param {Player} player - The player to place the ball on.
 */
Engine.prototype.start_break_out = function(player) {
	// TODO: Add Break-out mode!
};


/**
 * `Engine.get_entities` returns all entities in the game for the screen to draw.
 * @returns {Entity[]} An array with all entities (players, enemies, ...)
 */
Engine.prototype.get_entities = function() {
	return this.players.concat(this.enemies, this.enemy_bullets, this.player_bullets, this.walls, this.goodies, this.gui);
};


/**
 * `Engine.get_texts` returns all text elements in the game for the screen to
 * draw.
 * @returns {Text[]} An array with all text elements
 */
Engine.prototype.get_texts = function() {
	return this.texts;
};


/**
 * @typedef {Object} Bounds
 * @property {number} top    - The uppermost pixel
 * @property {number} right  - The rightmost pixel
 * @property {number} left   - The leftmost pixel
 * @property {number} bottom - The lowermost pixel
 */


export {Engine};
