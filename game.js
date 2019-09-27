'use strict';

/*
 * Space Invaders is a game written by Mathias Bockwoldt in Javascript
 * (ECMAScript 2018) without any frameworks for the it-talents.de competition
 * September 2019 sponsored by Airbus.
 *
 * https://www.it-talents.de/foerderung/code-competition/airbus-code-competition-09-2019
 *
 * More information is given in the <tt>readme.md</tt>.
 */

// MAYBE: Increase shooting probability for enemies, when only few are left


import {Start} from './start.js';
import {Engine} from './engine.js';
import {Highscore} from './highscore.js';
import {Text} from './text.js';
import {Resources} from './resources.js';
import {Input} from './input.js';

// Attention! No curly brackets. This uses the default export that is dependent
// on whether this runs in a browser or not (for testing in node.js).
import Screen from './screen.js';


/**
 * <tt>Game</tt> is the master object for the Space Invaders game. It manages
 * timing, the stages and the screen.
 *
 * @constructor
 * @param {object} options
 * 		Various options for the game. See options.js for details.
 * @param {Level[]} levels
 * 		Levels to load for the player
 */
function Game(options, levels) {
	this.options = options;
	this.levels = levels;

	this.version = 'v0.5';

	this.last_time = 0;

	// last_fps and frames are only used to show the current frames per second
	// they might be removed after finishing the game.
	this.last_fps = 0;
	this.frames = 0;
	this.fps = new Text(
		'', 2, this.options.total_size.h - 2,
		Infinity, 'left', '#000000', 10
	);
	this.show_fps = true;

	this.stage = null;
	this.screen = null;


	// The global object resources is defined differently, depending on the
	// context (browser vs. node.js)
	if(typeof window === 'undefined') {
		global.resources = new Resources();
		global.input = new Input();
	}
	else {
		window.resources = new Resources();
		window.input = new Input();

		document.addEventListener('keydown', function(e) {
			input.set_key(e.code || e.key, true);
		});

		document.addEventListener('keyup', function(e) {
			input.set_key(e.code || e.key, false);
		});
	}

	// And finally, the necessary graphics are loaded and the game is started as
	// soon as the graphics were loaded.
	resources.on_ready(() => {this.start();});
	resources.load([
		'gfx/sprites.png',
		'gfx/keys.png',
	]);
}


/**
 * <tt>Game.loop</tt> is the actual game loop. It lets itself being called by
 * Javascript, updates the game, and renders it.
 * Currently, also the frames per second are shown for debug purposes.
 */
Game.prototype.loop = function() {
	// I don't know how much time passed since the last frame, so I try to find
	// it out and give the time delta (dt) to the update function, so movement
	// is smooth even if the function is, for any reason, not called regularly.
	const now = Date.now();
	let dt = (now - this.last_time) / 1000;

	// If the game was paused, the time delta will very long, so I'll pretend
	// nothing happened.
	if(dt > 0.5) {
		dt = 0;
	}

	// Update the game and draw the newest state.
	const next_stage = this.update(dt);
	const texts = this.stage.get_texts();
	texts.fps = [this.fps];
	this.screen.render(this.stage.get_entities(), texts);
	this.update_fps(now);

	this.last_time = now;

	// If the current stage has signalled finish, load the next stage.
	if(next_stage !== null) {
		this.next_stage(next_stage);
	}

	// Ask Javascript to call this function again when suitable.
	// Advantage over a timeout is that it automatically pauses the game when
	// the window is, for example, minimized.
	// This will not loop in nodejs for testing purposes!
	if(typeof window !== 'undefined') {
		requestAnimationFrame(() => this.loop());
	}
};


/**
 * <tt>Game.update_fps</tt> is a debugging function to show the current frames
 * per second.
 *
 * @param {number} now - The current Javascript timestamp (i.e. in milliseconds)
 */
Game.prototype.update_fps = function(now) {
	// FPS will be shown as 1/s (== Hz)
	this.frames++;
	if(now - this.last_fps > 1000) {
		if(this.show_fps) {
			this.fps.text = this.frames;
		}
		this.frames = 0;
		this.last_fps = now;
	}
};


/**
 * <tt>Game.update</tt> updates all aspects of the game.
 * Currently, it only updates the current stage.
 *
 * @param {number} dt
 * 		The time delta since the last update in seconds
 * @returns {object|null}
 * 		If the stage is finished, an object with information for the next stage
 * 		is returned. Otherwise, <tt>null</tt> is returned.
 */
Game.prototype.update = function(dt) {
	this.stage.handle_input();
	return this.stage.update(dt);
};


/**
 * <tt>Game.start</tt> starts the game. That is, it creates and setups the stage,
 * creates the screen, and starts the game loop.
 */
Game.prototype.start = function() {
	this.stage = new Start(this.options.total_size, 1, this.version);
	this.stage.setup();

	this.screen = new Screen('game', this.options.total_size);

	this.last_time = Date.now();
	this.loop();
};


/**
 * <tt>Game.next_stage</tt> changes the stage to the given stage. It will try to
 * use information given in the payload to initialize the new stage.
 *
 * @param {object} payload
 * 		An object with stage-specific information.
 * @param {string} payload.next_stage
 * 		The name of the stage to switch to (one of 'start', 'game', 'highscore')
 */
Game.prototype.next_stage = function(payload) {
	switch(payload.next_stage) {
		case 'start': {
			const num_players = 'num_players' in payload ?
				payload.num_players :
				this.options.num_players;
			this.stage = new Start(this.options.total_size, num_players, this.version);
			break;
		}
		case 'game': {
			const num_players = 'num_players' in payload ?
				payload.num_players :
				this.options.num_players;
			const start_level = 'start_level' in payload ?
				payload.start_level :
				this.options.start_level;
			this.stage = new Engine(
				this.options.total_size, this.options.border, num_players, this.levels, start_level
			);
			break;
		}
		case 'highscore': {
			const current_date = new Date();
			const scores = 'scores' in payload ? payload.scores : [];
			const level = 'level' in payload ? payload.level : 0;
			this.stage = new Highscore(this.options.total_size, scores, level, current_date);
			break;
		}
		default:
			throw 'Unknown next stage: ' + payload.next_stage;
	}

	this.stage.setup();
};


/**
 * @typedef {object} Level
 * @property {string[]} fort
 * 		The shape of a fort. <tt>X</tt> is a wall and <tt>_</tt> an empty space.
 * @property {number} forts
 * 		The number of forts in the level.
 * @property {string[]} enemies
 * 		Position of enemies. Numbers <tt>0-2</tt> define an enemy of that type.
 * 		<tt>_</tt> is an empty space.
 */


export {Game};
