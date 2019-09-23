'use strict';

import {Player, Enemy, Mystery, Wall} from './entities.js';
import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


// MAYBE: Show achieved score when killing an enemy or getting the coin goody


/**
 * <tt>Engine</tt> is the actual game engine. It *should* work without any
 * screen, making, it more easily testable.
 *
 * @constructor
 * @param {object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} border - The window border width in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 * @param {Level[]} levels - The available levels
 * @param {number} [level_num=0] - The level to start at
 */
function Engine(window_size, border, num_players, levels, level_num=0) {
	// These variables store all objects in the game.
	this.enemies = [];
	this.mysteries = [];
	this.enemy_bullets = [];
	this.players = [];
	this.player_bullets = [];
	this.walls = [];
	this.goodies = [];
	this.gui = [];
	this.texts = {};

	// Some status variables that are valid for all enemies (since enemies move
	// in a synchronized way.
	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1;
	this.down_moves = 0;

	this.game_is_over = false;

	this.level_list = levels;
	this.level_num = level_num;

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
		bottom: window_size.h - border*2,
	};
}


/**
 * <tt>Engine.next_level</tt> loads the next level.
 */
Engine.prototype.next_level = function() {
	this.level_num++;
	this.setup();
};


/**
 * <tt>Engine.setup</tt> initializes the game with the player and enemies.
 *
 * @param {boolean} [fresh=false]
 * 		If <tt>true</tt>, forces new player objects (instead of using the
 * 		existing ones). If no player objects are present, they are created in
 * 		any case.
 */
Engine.prototype.setup = function(fresh=false) {
	this.enemies = [];
	this.mysteries = [];
	this.enemy_bullets = [];
	this.player_bullets = [];
	this.walls = [];
	this.goodies = [];
	this.gui = [];
	this.texts = {
		player_scores: [],
		player_lives: [],
		level: [],
		floating: [],
	};

	const recurrence = Math.floor(this.level_num / this.level_list.length);

	this.enemy_direction = -1;
	this.enemy_moves_down = 0;
	this.enemy_speed_factor = 1 + recurrence * 0.33;
	this.down_moves = 0;

	this.game_is_over = false;

	const level = this.level_list[this.level_num % this.level_list.length];

	this.setup_players(fresh);
	this.setup_gui();
	this.setup_enemies(level.enemies);
	this.setup_forts(level.fort, level.forts);
};


/**
 * <tt>Engine.setup_players</tt> set ups the players in a new level.
 *
 * @param {boolean} fresh
 * 		If <tt>true</tt>, forces new player objects (instead of using the
 * 		existing ones). If no player objects are present, they are created in
 * 		any case.
 */
Engine.prototype.setup_players = function(fresh) {
	if(fresh) {
		this.players = [];
	}

	const left = this.outer_bounds.left;
	const right = this.outer_bounds.right;

	if(this.players.length) {
		// Reset players
		for(let i = 0; i < this.num_players; i++) {
			this.players[i].resurrect();
			this.players[i].x = (i+1) * (right - left) / (this.num_players+1) + left;
		}
	}
	else {
		const bottom = this.outer_bounds.bottom;
		// Create players
		for(let i = 0; i < this.num_players; i++) {
			this.players.push(new Player(
				(i+1) * (right - left) / (this.num_players + 1) + left, bottom - 20, i
			));
		}
	}
};


/**
 * <tt>Engine.setup_gui</tt> set ups the GUI in a new level.
 */
Engine.prototype.setup_gui = function() {
	// Life icon for player 1
	this.gui.push(new GUI_Element(
		this.outer_bounds.left + 5,
		this.outer_bounds.top + 10,
		'life'
	));

	const life_width = this.gui[this.gui.length - 1].w;

	// Life counter text player 1
	this.texts.player_lives.push(new Text(
		this.players[0].lives,
		this.outer_bounds.left + 10 + life_width,
		this.outer_bounds.top + 30
	));

	this.update_lives(this.players[0]);

	// Score icon for player 1
	this.gui.push(new GUI_Element(
		this.outer_bounds.left + 95,
		this.outer_bounds.top + 10,
		'score'
	));

	const score_width = this.gui[this.gui.length - 1].w;

	// Score counter text player 1
	this.texts.player_scores.push(new Text(
		'',
		this.outer_bounds.left + 100 + score_width,
		this.outer_bounds.top + 30,
	));
	this.texts.player_scores[0].set_score(this.players[0].score);

	if(this.num_players === 2) {
		// Life icon for player 2
		this.gui.push(new GUI_Element(
			this.outer_bounds.right - 5 - life_width,
			this.outer_bounds.top + 10,
			'life'
		));

		// Life counter text player 2
		this.texts.player_lives.push(new Text(
			this.players[1].lives,
			this.outer_bounds.right - 10 - life_width,
			this.outer_bounds.top + 30,
			Infinity,
			'right'
		));

		this.update_lives(this.players[1]);

		// Score icon for player 2
		this.gui.push(new GUI_Element(
			this.outer_bounds.right - 95,
			this.outer_bounds.top + 10,
			'score')
		);

		// Score counter text player 2
		this.texts.player_scores.push(new Text(
			'',
			this.outer_bounds.right - 100,
			this.outer_bounds.top + 30,
			Infinity,
			'right'
		));
		this.texts.player_scores[1].set_score(this.players[1].score);
	}

	this.texts.level.push(new Text(
		'Level ',
		(this.outer_bounds.right + this.outer_bounds.left)/2,
		this.outer_bounds.top + 30,
		Infinity,
		'right'
	));
	this.texts.level.push(new Text(
		this.level_num + 1,
		(this.outer_bounds.right + this.outer_bounds.left)/2,
		this.outer_bounds.top + 30,
	));
};


/**
 * <tt>Engine.setup_enemies</tt> set ups the enemies in a new level.
 *
 * @param {string[]} enemies - The enemy pattern as described in {@link Level}
 */
Engine.prototype.setup_enemies = function(enemies) {
	const ib_right = this.inner_bounds.right;
	const ib_left = this.inner_bounds.left;
	const enemy_offset = ib_left + (ib_right - ib_left) / 2 - enemies[0].length / 2 * 60;
	const enemy_upper = 50;

	for(let y = 0; y < enemies.length; y++) {
		for(let x = 0; x < enemies[0].length; x++) {
			let type = enemies[y][x];
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
};


/**
 * <tt>Engine.setup_forts</tt> set ups the forts in a new level.
 *
 * @param {string[]} fort - The structure of a fort as described in {@link Level}
 * @param {number} forts - The number of forts
 */
Engine.prototype.setup_forts = function(fort, forts) {
	const fort_x_dist = (this.inner_bounds.right - this.inner_bounds.left) / (forts + 1);
	const fort_offset = this.inner_bounds.left + fort_x_dist - fort[0].length / 2 * 16;
	const fort_upper = 530 - fort.length * 16;

	for(let i = 0; i < forts; i++) {
		for(let y = 0; y < fort.length; y++) {
			for(let x = 0; x < fort[0].length; x++) {
				if(fort[y][x] === 'X') {
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
 * <tt>Engine.handle_input</tt> handles player input.
 *
 * @param {string} key - The key that was pressed
 * @param {boolean} key_down - Whether the key is down or up
 */
Engine.prototype.handle_input = function(key, key_down) {
	if(this.num_players === 1) {
		switch(key) {
			case 'LEFT0':
			case 'LEFT1':
				this.players[0].moving = -1 * key_down;
				break;
			case 'RIGHT0':
			case 'RIGHT1':
				this.players[0].moving = 1 * key_down;
				break;
			case 'SPACE':
			case 'ENTER':
			case 'UP0':
			case 'UP1':
				this.players[0].firing = key_down;
				break;
		}
	}
	else {
		switch(key) {
			case 'LEFT0':
				this.players[0].moving = -1 * key_down;
				break;
			case 'LEFT1':
				this.players[1].moving = -1 * key_down;
				break;
			case 'RIGHT0':
				this.players[0].moving = 1 * key_down;
				break;
			case 'RIGHT1':
				this.players[1].moving = 1 * key_down;
				break;
			case 'SPACE':
			case 'UP0':
				this.players[0].firing = key_down;
				break;
			case 'ENTER':
			case 'UP1':
				this.players[1].firing = key_down;
				break;
		}
	}
}


/**
 * <tt>Engine.update</tt> updates all objects in the game.
 *
 * @param {number} dt
 * 		The time delta since last update in seconds
 * @returns {object|null}
 * 		If the game is over, this returns an object with the next stage,
 * 		score(s), and level. Otherwise, <tt>null</tt> is returned.
 */
Engine.prototype.update = function(dt) {
	let living_players = 0;
	for(let player of this.players) {
		if(player.is_dead) {
			continue;
		}
		living_players++;
		const bullets = player.update(dt, this.inner_bounds);
		this.player_bullets.push(...bullets);
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
			level: this.level_num,
		};
	}

	if(this.down_moves > 3 && this.mysteries.length === 0 && Math.random() < 0.001) {
		// Start a mystery if the enemies gave enough space to the top
		this.mysteries.push(new Mystery(Math.round(Math.random()), this.outer_bounds));
	}

	this.update_enemies(dt);
	this.update_entities(dt);

	this.collide_bullets(this.player_bullets, this.enemy_bullets);
	this.collide_bullets(this.player_bullets, this.enemies);
	this.collide_bullets(this.player_bullets, this.mysteries);
	this.collide_bullets(this.enemy_bullets, this.players);
	this.collide_bullets(this.player_bullets, this.walls);
	this.collide_bullets(this.enemy_bullets, this.walls);
	this.collide_goodies(this.goodies, this.players);

	if(this.enemies.length === 0) {
		this.next_level();
	}

	return null;
};


/**
 * <tt>Engine.update_enemies</tt> udpates all enemies.
 *
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.update_enemies = function(dt) {
	const dx = !this.enemy_moves_down ? this.enemy_direction * dt * this.enemy_speed_factor : 0;
	const dy = this.enemy_moves_down ? dt * this.enemy_speed_factor : 0;

	let reached_boundary = false;
	for(let enemy of this.enemies) {
		reached_boundary = enemy.update(dt, dx, dy, this.inner_bounds) || reached_boundary;
	}

	if(reached_boundary) {
		if(this.enemy_moves_down) {
			this.game_is_over = true;
		}
		else {
			this.enemy_moves_down = 0.2;
			this.enemy_direction *= -1;
			this.enemy_speed_factor += 0.05;
			this.down_moves++;
		}
	}

	if(this.enemy_moves_down) {
		this.enemy_moves_down -= dt;
		if(this.enemy_moves_down < 0) {
			this.enemy_moves_down = 0;
		}
	}

	for(let enemy of this.enemies) {
		const bullet = enemy.fire();
		if(bullet.length > 0) {
			this.enemy_bullets.push(bullet[0]);
		}
	}
};


/**
 * <tt>Engine.update_entities</tt> udpates all bullets, goodies, walls and
 * texts. It also removes entities that are not active anymore.
 *
 * @param {number} dt - The time delta since last update in seconds
 */
Engine.prototype.update_entities = function(dt) {
	for(let bullet of this.enemy_bullets) {
		bullet.update(dt, this.outer_bounds);
	}

	for(let bullet of this.player_bullets) {
		bullet.update(dt, this.outer_bounds);
	}

	for(let mystery of this.mysteries) {
		mystery.update(dt, this.outer_bounds);
	}

	for(let goody of this.goodies) {
		goody.update(dt, this.outer_bounds);
	}

	for(let wall of this.walls) {
		wall.update(dt, this.outer_bounds);
	}

	for(let text_group in this.texts) {
		for(let text of this.texts[text_group]) {
			text.update(dt);
		}

		this.texts[text_group] = this.texts[text_group].filter(text => text.active);
	}

	// Remove entities that are inactive. They may have either left the screen
	// or their explosion is finished.
	this.player_bullets = this.player_bullets.filter(bullet => bullet.active);
	this.enemy_bullets = this.enemy_bullets.filter(bullet => bullet.active);
	this.mysteries = this.mysteries.filter(mystery => mystery.active);
	this.goodies = this.goodies.filter(goody => goody.active);
	this.walls = this.walls.filter(wall => wall.active);
	this.enemies = this.enemies.filter(enemy => enemy.active);
};


/**
 * <tt>Engine.collide_all</tt> test if any element of <tt>a</tt> overlaps with
 * any element of <tt>b</tt>. If an element of <tt>a</tt> collides with multiple
 * elements of <tt>b</tt>, only the first element <tt>b</tt> will be returned.
 *
 * @param {object[]} a
 * 		First array of objects to test
 * @param {object[]} b
 * 		Second array of objects to test
 * @returns {Array[]}
 * 		An array of tuples containing the indices of colliding objects. It is in
 * 		the form: <tt>[[idx_a, idx_b], ...]</tt>.
 *
 */
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
 * <tt>Engine.collide_bullets</tt> compares all bullets of the first list with
 * all entities of the second list and tests if they collide. If so, depending
 * on the target, effects happen.
 *
 * @param {Bullet[]} bullets
 * 		The array of Bullets
 * @param {Entity[]} others
 * 		The second array of entities. Bullets, Enemies, Players, or Walls
 */
Engine.prototype.collide_bullets = function(bullets, others) {
	const colliding = this.collide_all(bullets, others);

	for(let [a, b] of colliding) {
		const bullet = bullets[a];
		const other = others[b];

		if(bullet.owner >= 0) {
			this.players[bullet.owner].score += other.score_value;
			this.texts.player_scores[bullet.owner].set_score(this.players[bullet.owner].score);
		}

		// Initiate specific "killing" animation
		const goody = other.kill();
		if(goody !== null) {
			this.goodies.push(goody);
		}

		if(other.object === 'player') {
			this.update_lives(other);
		}
	}

	this.remove_multiple_elements(bullets, colliding.map(x => x[0]));
};


/**
 * <tt>Engine.collide_goodies</tt> compares all goodies of the first list with
 * all players of the second list and tests if they collide. If so, the goody is
 * applied on the player.
 *
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
 * <tt>Engine.collider</tt> checks if the bounding boxes of a and b overlap.
 * There is never an overlap, if either a or b are not <tt>collidable</tt> or
 * either a or b has not width or height. Objects *just* touching on the border
 * are considered overlapping.
 *
 * @param {Entity} a - The first object
 * @param {number} a.x - The x coordinate (from left) in pixel
 * @param {number} a.y - The y coordinate (from top) in pixel
 * @param {number} a.w - The width in pixel
 * @param {number} a.h - The height in pixel
 * @param {Entity} b - The second object
 * @param {number} b.x - The x coordinate (from left) in pixel
 * @param {number} b.y - The y coordinate (from top) in pixel
 * @param {number} b.w - The width in pixel
 * @param {number} b.h - The height in pixel
 * @returns {boolean} Whether or not the bounding boxes overlap.
 */
Engine.prototype.collider = function(a, b) {
	// MAYBE: If the bounding boxes hit, this might continue doing some kind of pixel-perfect detection.
	return a.collidable && b. collidable && !(
		a.x       > b.x + b.w ||
		a.y       > b.y + b.h ||
		a.x + a.w < b.x       ||
		a.y + a.h < b.y
	);
};


/**
 * <tt>Engine.remove_multiple_elements</tt> removes all elements from array with
 * the indices given in <tt>to_remove</tt> in place. <tt>to_remove</tt> must be
 * sorted!
 *
 * @param {Array} array - The array to change
 * @param {number[]} to_remove - The list of indices to remove from array
 */
Engine.prototype.remove_multiple_elements = function(array, to_remove) {
	for(let i = to_remove.length - 1; i >= 0; i--) {
		array.splice(to_remove[i],1);
	}
};


/**
 * <tt>Engine.apply_goody</tt> applies a goody to a player. Depending on the
 * goody, the player gets an advantage (or maybe also a disadvantage).
 *
 * @param {number} type - The type of the goody.
 * @param {Player} player - The player to apply the goody on.
 */
Engine.prototype.apply_goody = function(type, player) {
	switch(type) {
		case 0: {
			player.kill();
			this.update_lives(player);
			break;
		}
		case 1: {
			player.lives++;
			this.update_lives(player);
			break;
		}
		case 2: {
			player.apply_invulnerability();
			break;
		}
		case 3: {
			player.apply_speed_up();
			break;
		}
		case 4: {
			player.apply_double_laser();
			break;
		}
		case 5: {
			player.apply_rapid_fire();
			break;
		}
		case 6: {
			player.score += 300;
			this.texts.player_scores[player.num].set_score(player.score);
			break;
		}
		default:
			throw 'Unknown Goody type received: ' + type;
	}
};


/**
 * <tt>Engine.update_lives</tt> updates the shown number of remaining lives. It
 * will not show negative numbers to prevent an ugly "-1" when the player lost
 * the last life. It will also not show numbers with more than one digit. A 9
 * will be shown in this case.
 *
 * @param {Player} player - The player whose life is to be shown.
 */
Engine.prototype.update_lives = function(player) {
	let to_show = player.lives;
	if(to_show < 0) {
		to_show = 0;
	}
	else if(to_show >= 10) {
		to_show = 9;
	}

	this.texts.player_lives[player.num].text = to_show;
};


/**
 * <tt>Engine.get_entities</tt> returns all entities in the game for the screen
 * to draw.
 *
 * @returns {Entity[]} An array with all entities (players, enemies, ...)
 */
Engine.prototype.get_entities = function() {
	return this.players.concat(
		this.enemies,
		this.mysteries,
		this.enemy_bullets,
		this.player_bullets,
		this.walls,
		this.goodies,
		this.gui);
};


/**
 * <tt>Engine.get_texts</tt> returns all text elements in the game for the
 * screen to draw.
 *
 * @returns {Text[]} An array with all text elements
 */
Engine.prototype.get_texts = function() {
	return this.texts;
};


/**
 * @typedef {object} Bounds
 * @property {number} top    - The uppermost pixel
 * @property {number} right  - The rightmost pixel
 * @property {number} left   - The leftmost pixel
 * @property {number} bottom - The lowermost pixel
 */


/**
 * @typedef {object} Level
 * @property {string[]} fort
 * 		Lines of a fort, where "X" is a Wall and "_" is empty.
 * @property {number} forts
 * 		Number of forts in the level
 * @property {string[]} enemies
 * 		Lines of enemies with numbers [0-2] representing the respective enemy
 */


export {Engine};
