'use strict';

/*
 * Space Invaders is a game written in Javascript (ECMA 2015+) without any
 * frameworks for the it-talents.de competition September 2019 sponsored by
 * Airbus.
 *
 * More information is given in the `readme.md`.
 */

// TODO: Implement forts (these protection thingies that block shots and can slowly disintegrate)
// TODO: Implement different levels <-- add more monsters
// TODO: Implement power-ups
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


import { Resources } from './resources.js';
import { Sprite } from './sprite.js';
import { Player, Enemy, Bullet } from './entities.js';
import { Engine } from './engine.js';

// Attention! No curly brackets. This uses the default export that is dependent
// on whether this runs in a browser or not (for testing in node.js).
import Input from './input.js';
import GUI from './gui.js';


/**
 * `Game` is the master object for the Space Invaders game. It manages timing,
 * the engine and the gui.
 * @constructor
 */
function Game() {

	// TODO: The options and the version may be externalized using json or the like.
	this.options = {
		total_size: {w: 900, h: 600},
		border: 20,
	};

	this.version = 'pre-alpha';

	this.last_time = 0;

	// last_fps and frames are only used to show the current frames per second
	// they might be removed after finishing the game.
	this.last_fps = 0;
	this.frames = 0;

	this.engine = null;
	this.gui = null;


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
	this.gui.render(this.engine.get_entities());
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
 * creates the gui, and starts the game loop.
 */
Game.prototype.start = function() {
	this.engine = new Engine(this.options.total_size, this.options.border, 1);
	this.engine.setup();

	this.gui = new GUI('game', this.options.total_size);

	this.last_time = Date.now();
	this.loop();
};
