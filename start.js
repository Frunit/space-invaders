'use strict';

import {lang, lang_change} from './i18n.js';
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

	// Selector

	this.selector = new GUI_Element(300, 200, 'selector');
	this.selector.x = this.window_size.w / 2 - this.selector.w - 10;
	this.selector.y = this.window_size.h / 2 + this.selector.h * (this.num_players - 2);

	// Keys

	this.keys.push(new GUI_Element(70, 469, 'keys1'));
	this.keys.push(new GUI_Element(565, 469, 'keys2'));

	// Enemies

	for(let y = 0; y < 3; y++) {
		for(let x = 0; x < 3; x++) {
			this.enemies.push(new Enemy(370 + x * 60, 50 + y * 50, y));
		}
	}

	// Text

	this.keys.push(new GUI_Element(
		this.window_size.w / 2 - this.selector.w - 20,
		this.window_size.h / 2 - this.selector.h * 2,
		'arrow_left'
	));
	this.keys.push(new GUI_Element(
		this.window_size.w / 2 - this.selector.w + 40,
		this.window_size.h / 2 - this.selector.h * 2,
		'arrow_right'
	));
	this.update_texts();

	// Version

	this.texts.version = [new Text(
		this.version,
		this.window_size.w - 5, // x
		15,                     // y
		'right',                // alignment
		10                      // size
	)];
};


/**
 * <tt>Start.handle_input</tt> handles input.
 * (<i>- sincerely, Captain Obvious</i>)
 */
Start.prototype.handle_input = function() {
	if(input.is_down_arr(['SPACE', 'ENTER'])) {
		this.finished = true; // This will trigger a stage change upon next update
	}

	else if(input.is_down_arr(['UP0', 'UP1', 'DOWN0', 'DOWN1'])) {
		this.select_next();
	}

	else if(input.is_down_arr(['RIGHT0', 'RIGHT1'])) {
		lang_change(1);
		this.update_texts();
	}

	else if(input.is_down_arr(['LEFT0', 'LEFT1'])) {
		lang_change(-1);
		this.update_texts();
	}

	input.reset();
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
 * <tt>Start.select_next</tt> selects the other menu point.
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


/**
 * <tt>Start.update_texts</tt> updates all texts to the current language.
 */
Start.prototype.update_texts = function() {
	this.texts.fixed = [];

	// Player one/two
	this.texts.fixed.push(new Text(
		lang.one_player,
		this.window_size.w / 2 + 5,
		this.window_size.h / 2
	));
	this.texts.fixed.push(new Text(
		lang.two_players,
		this.window_size.w / 2 + 5,
		this.window_size.h / 2 + this.selector.h
	));

	// Language
	this.texts.fixed.push(new Text(
		lang.lang,
		this.window_size.w / 2 - this.selector.w / 2 - 13,
		this.window_size.h / 2 - this.selector.h - 15,
		'center'
	));

	// Keys
	this.texts.fixed.push(new Text(lang.left, 125, 520, 'right'));
	this.texts.fixed.push(new Text(lang.fire, 154, 460, 'center'));
	this.texts.fixed.push(new Text(lang.right, 190, 520));
	this.texts.fixed.push(new Text(lang.fire, 369, 520, 'center'));

	this.texts.fixed.push(new Text(lang.fire, 601, 485, 'center'));
	this.texts.fixed.push(new Text(lang.left, 739, 520, 'right'));
	this.texts.fixed.push(new Text(lang.fire, 773, 460, 'center'));
	this.texts.fixed.push(new Text(lang.right, 808, 520));
};


export {Start};
