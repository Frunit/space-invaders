'use strict';

/*
 * Space Invaders is a game written in Javascript (ECMA 2015+) without any
 * frameworks for the it-talents.de competition September 2019 sponsored by
 * Airbus.
 *
 * More information is given in the `readme.md`.
 */

// TODO: Implement special UFO on top that traverses the screen
// TODO: Maybe implement music and sound


// Depending on whether the browser or node.js is used, offer a different debug
// function
if(typeof window === 'undefined') {
	const debug = function(num, message) {
		console.log(num, message);
	};
}
else {
	window.debug = function(num, message) {
		document.getElementById('debug' + num).value = message;
	};
}


import { Engine } from './engine.js';

// Attention! No curly brackets. This uses the default export that is dependent
// on whether this runs in a browser or not (for testing in node.js).
import Resources from './resources.js';
import Input from './input.js';
import Screen from './screen.js';


/**
 * `Game` is the master object for the Space Invaders game. It manages timing,
 * the engine and the screen.
 * @constructor
 */
export function Game() {

	// TODO: The options and the version may be externalized using json or the like.
	this.options = {
		total_size: {w: 900, h: 600},
		border: 20,
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

	this.engine = null;
	this.screen = null;


	// The global object `input` takes care of key presses that are fed into it by
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
 * `Game.loop` is the actual game loop. It lets itself being called by
 * Javascript, updates the game, and renders it.
 * Currently, also the frames per second are shown for debug purposes.
 */
Game.prototype.loop = function() {
	// I don't know how much time passed since the last frame, so I try to find
	// it out and give the time delta (dt) to the update function, so movement
	// is smooth even if the function is, for any reason, not called regularly.
	const now = Date.now();
	let dt = (now - this.last_time) / 1000;

	if(dt > 0.5) {
		dt = 0;
	}

	// Update the game and draw the newest state.
	this.update(dt);
	this.screen.render(this.engine.get_entities());
	this.update_fps(now);

	this.last_time = now;

	// Ask Javascript to call this function again when suitable.
	// Advantage over a timeout is that it automatically pauses the game when
	// the window is, for example, minimized.
	requestAnimationFrame(() => this.loop());
};


/**
 * `Game.update_fps` is a debugging function to show the current frames per
 * second.
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
 * `Game.update` updates all aspects of the game.
 * Currently, it only updates the engine.
 * @param {number} dt - The time delta since the last update in seconds
 */
Game.prototype.update = function(dt) {
	this.engine.handle_input(dt);
	this.engine.update(dt);
};


/**
 * `Game.start` starts the game. That is, it creates and setups the engine,
 * creates the screen, and starts the game loop.
 */
Game.prototype.start = function() {
	this.engine = new Engine(this.options.total_size, this.options.border, 1, this.levels);
	this.engine.setup();

	this.screen = new Screen('game', this.options.total_size);

	this.last_time = Date.now();
	this.loop();
};
