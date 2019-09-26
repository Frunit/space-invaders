'use strict';

import {GUI_Element} from './guielement.js';
import {Enemy} from './entities.js';
import {Text} from './text.js';


/**
 * <tt>Start</tt> is the start screen.
 *
 * @constructor
 * @param {object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 * @param {string} version - The version of the game
 */
function Start(window_size, num_players, version) {
	this.name = 'start';
	this.window_size = window_size;
	this.num_players = num_players || 1;
	this.version = version;
	this.finished = false;

	this.selector = null;
	this.keys = [];
	this.enemies = [];
	this.texts = {};

	this.enemy_direction = -1;
}


/**
 * <tt>Start.setup</tt> initializes the start screen.
 */
Start.prototype.setup = function() {
	this.finished = false;
	this.enemy_direction = -1;

	this.texts = {fixed: []};

	// Selector

	this.selector = new GUI_Element(300, 200, 'selector');
	this.selector.x = this.window_size.w / 2 - this.selector.w - 10;
	this.selector.y = this.window_size.h / 2 + this.selector.h * (this.num_players - 2);

	this.texts.fixed.push(new Text(
		'One player',
		this.window_size.w / 2 + 5,
		this.window_size.h / 2
	));
	this.texts.fixed.push(new Text(
		'Two players',
		this.window_size.w / 2 + 5,
		this.window_size.h / 2 + this.selector.h
	));

	// Keys

	this.keys.push(new GUI_Element(70, 445, 'keys1'));
	this.keys.push(new GUI_Element(590, 445, 'keys2'));

	// Enemies

	for(let y = 0; y < 3; y++) {
		for(let x = 0; x < 3; x++) {
			this.enemies.push(new Enemy(370 + x * 60, 50 + y * 50, y));
		}
	}

	// Version

	this.texts.fixed.push(new Text(
		this.version,
		this.window_size.w - 5, // x
		15,                     // y
		Infinity,               // duration
		'right',                // alignment
		'#000000',              // color
		10                      // size
	));
};


/**
 * <tt>Start.handle_input</tt> handles input.
 * (<i>- sincerely, Captain Obvious</i>)
 *
 * @param {string} key - The key that was pressed
 * @param {boolean} key_down - Whether the key is down or up
 */
Start.prototype.handle_input = function(key, key_down) {
	// On the start screen, nothing happens, if any key is unpressed.
	if(!key_down) {
		return;
	}

	switch(key) {
		case 'UP0':
		case 'UP1':
			this.select_next(-1);
			break;
		case 'DOWN0':
		case 'DOWN1':
			this.select_next(1);
			break;
		case 'SPACE':
		case 'ENTER':
			this.finished = true; // This will trigger a stage change upon next update
			break;
	}

	// Other keys are ignored
};


/**
 * <tt>Start.update</tt> checks if the next stage can be called. If so, return
 * an object for the next stage, otherwise return <tt>null</tt>.
 *
 * @param {number} dt - The time delta since last update in seconds
 * @returns {object|null} See description.
 */
Start.prototype.update = function(dt) {
	if(this.finished) {
		return {
			next_stage: 'game',
			num_players: this.num_players,
		};
	}

	const dx = this.enemy_direction * dt;
	const inner_bounds = {left: 20, right: this.window_size.w - 20, bottom: 1000, top: 0};
	let reached_boundary = false;
	for(let enemy of this.enemies) {
		reached_boundary = enemy.update(dt, dx, 0, inner_bounds) || reached_boundary;
	}

	if(reached_boundary) {
		this.enemy_direction *= -1;
	}

	return null;
};


/**
 * <tt>Start.select_next</tt> Selects the other menu point.
 */
Start.prototype.select_next = function() {
	this.num_players = this.num_players === 1 ? 2: 1;

	this.selector.y = this.window_size.h / 2 + this.selector.h * (this.num_players - 2);
};


/**
 * <tt>Start.get_entities</tt> returns all entities for the screen to draw.
 *
 * @returns {object[]} An array with all entities
 */
Start.prototype.get_entities = function() {
	return [this.selector].concat(
		this.keys,
		this.enemies);
};


/**
 * <tt>Start.get_texts</tt> returns all text elements for the screen to draw.
 *
 * @returns {Text[]} An array with all text elements
 */
Start.prototype.get_texts = function() {
	return this.texts;
};


export {Start};
