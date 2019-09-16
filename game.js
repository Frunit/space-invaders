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
// MAYBE: Implement music and sound

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
import Screen from './screen.js';


/**
 * <tt>Game</tt> is the master object for the Space Invaders game. It manages
 * timing, the stages and the screen.
 *
 * @constructor
 */
function Game(options, levels) {
	this.options = options;
	this.levels = levels;

	this.version = 'pre-alpha';

	this.last_time = 0;

	// last_fps and frames are only used to show the current frames per second
	// they might be removed after finishing the game.
	this.last_fps = 0;
	this.frames = 0;

	this.stage = null;
	this.screen = null;


	// The global object resources is defined differently, depending on the
	// context (browser vs. node.js)
	if(typeof window === 'undefined') {
		global.resources = new Resources();
	}
	else {
		window.resources = new Resources();

		// The meaning of `this` is dependent on the context. To keep the scope
		// of the `game` object, the current `this` is saved in `self`. If I
		// would use `this` in the event listeners, `this` would refer to the
		// event and not the `game` object.
		const self = this;

		document.addEventListener('keydown', function(e) {
			if(!e.repeat) {
				self.handle_input(e, true);
			}
		});

		document.addEventListener('keyup', function(e) {
			self.handle_input(e, false);
		});
	}

	// And finally, the necessary graphics are loaded and the game is started as
	// soon as the graphics were loaded.
	resources.on_ready(() => {this.start()});
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
	// This will not work in nodejs!
	if(typeof window !== 'undefined') {
		requestAnimationFrame(() => this.loop());
	}
};


/**
 * <tt>Game.handle_input</tt> determines the key pressed or lifted and sends the
 * right abstract key description to the current stage.
 *
 * @param {event} event
 * 		The keydown or keyup event
 * @param {boolean} key_down
 * 		<tt>true</tt>, if it is a keydown event, <tt>false</tt> if it is a
 * 		keyup event
 */
Game.prototype.handle_input = function(event, key_down) {
	if(this.stage === null) {
		return;
	}

	const code = event.code || event.key;
	let key = '';

	switch(code) {
		case 'ControlRight':
		case 'Control':
			key = 'CTRL'; break
		case 'ShiftLeft':
		case 'Shift':
			key = 'SHIFT'; break
		case 'Space':
		case 'Spacebar':
		case ' ':
			key = 'SPACE'; break;
		case 'Enter':
			key = 'ENTER'; break;
		case 'Escape':
		case 'Esc':
			key = 'ESCAPE'; break;
		case 'KeyA':
		case 'a':
			key = 'LEFT0'; break;
		case 'ArrowLeft':
			key = 'LEFT1'; break;
		case 'KeyD':
		case 'd':
			key = 'RIGHT0'; break;
		case 'ArrowRight':
			key = 'RIGHT1'; break;
		case 'KeyW':
		case 'w':
			key = 'UP0'; break;
		case 'ArrowUp':
			key = 'UP1'; break;
		case 'KeyS':
			key = 'DOWN0'; break;
		case 's':
		case 'ArrowDown':
			key = 'DOWN1'; break;
	}

	if(key !== '') {
		this.stage.handle_input(key, key_down);
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
		debug(4, 'FPS: ' + this.frames); // eslint-disable-line
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
	return this.stage.update(dt);
};


/**
 * <tt>Game.start</tt> starts the game. That is, it creates and setups the stage,
 * creates the screen, and starts the game loop.
 */
Game.prototype.start = function() {
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
			this.stage = new Start(this.options.total_size, num_players);
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
			this.stage = new Highscore(this.options.total_size, scores, level);
			break;
		}
		default:
			throw 'Unknown next stage: ' + payload.next_stage;
	}

	this.stage.setup();
};


export {Game};
