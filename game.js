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

// TODO: Implement special UFO on top that traverses the screen
// TODO: Maybe implement music and sound


// Depending on whether the browser or node.js is used, offer a different debug
// function
if(typeof window === 'undefined') {
	global.debug = function(num, message) {
		console.log(num, message);
	};
}
else {
	window.debug = function(num, message) {
		document.getElementById('debug' + num).value = message;
	};
}


import {Start} from './start.js';
import {Engine} from './engine.js';
import {Highscore} from './highscore.js';

// Attention! No curly brackets. This uses the default export that is dependent
// on whether this runs in a browser or not (for testing in node.js).
import Resources from './resources.js';
import Input from './input.js';
import Screen from './screen.js';


/**
 * <tt>Game</tt> is the master object for the Space Invaders game. It manages
 * timing, the stages and the screen.
 *
 * @constructor
 */
function Game() {

	// TODO: The options and the version may be externalized using json or the like.
	this.options = {
		total_size: {w: 900, h: 600},
		border: 20,
		num_players: 1,
		start_level: 0,
	};

	// TODO: Load levels from levels.json!
	this.levels = [
		{
			fort: [
				"__XXXX__",
				"XXXXXXXX",
				"XXXXXXXX",
				"XXXXXXXX",
				"XX____XX"
			],
			forts: 4,
			enemies: [
				"0000000000",
				"1111111111",
				"1111111111",
				"2222222222",
				"2222222222"
			]
		}
	];

	this.version = 'pre-alpha';

	this.last_time = 0;

	// last_fps and frames are only used to show the current frames per second
	// they might be removed after finishing the game.
	this.last_fps = 0;
	this.frames = 0;

	this.stage = null;
	this.screen = null;


	// The global object <tt>input</tt> takes care of key presses that are fed into it by
	// keydown and keyup events.
	// The global objects game and resources are defined last.
	// Both are defined differently, depending on the context (browser vs. node.js)
	if(typeof window === 'undefined') {
		global.input = new Input();
		global.resources = new Resources();
	}
	else {
		window.input = new Input();
		window.resources = new Resources();

		document.addEventListener('keydown', function(e) {
			input.set_key(e, true);
		});

		document.addEventListener('keyup', function(e) {
			input.set_key(e, false);
		});
	}

	// And finally, the necessary graphics are loaded and the game is started as
	// soon as the graphics were loaded.
	resources.on_ready(() => {this.start()});
	resources.load([
		'gfx/sprites.png',
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
	this.screen.render(this.stage.get_entities(), this.stage.get_texts());
	this.update_fps(now);

	this.last_time = now;

	// If the current stage has signalled finish, load the next stage.
	if(next_stage !== null) {
		this.next_stage(next_stage);
	}

	// Ask Javascript to call this function again when suitable.
	// Advantage over a timeout is that it automatically pauses the game when
	// the window is, for example, minimized.
	requestAnimationFrame(() => this.loop());
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
		debug(4, 'FPS: ' + this.frames);
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
	this.stage.handle_input(dt);

	return this.stage.update(dt);
};


/**
 * <tt>Game.start</tt> starts the game. That is, it creates and setups the stage,
 * creates the screen, and starts the game loop.
 */
Game.prototype.start = function() {
	//this.stage = new Engine(this.options.total_size, this.options.border, 1, this.levels, 0);
	this.stage = new Start(this.options.total_size, 1);
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
			const num_players = 'num_players' in payload ? payload.num_players : this.options.num_players;
			this.stage = new Start(num_players);
			break;
		}
		case 'game': {
			const num_players = 'num_players' in payload ? payload.num_players : this.options.num_players;
			const start_level = 'start_level' in payload ? payload.start_level : this.options.start_level;
			this.stage = new Engine(this.options.total_size, this.options.border, num_players, this.levels, start_level);
			break;
		}
		case 'highscore': {
			const scores = 'scores' in payload ? payload.scores : [];
			const level = 'level' in payload ? payload.level : 0;
			this.stage = new Highscore(scores, level);
			break;
		}
		default:
			throw 'Unknown next stage: ' + payload.next_stage;
	}

	this.stage.setup();
};


export {Game};
