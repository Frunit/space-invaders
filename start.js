'use strict';

import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


/**
 * `Start` is the start screen.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number} num_players - The number of players. Should be 1 or 2.
 */
function Start(window_size, num_players) {
	this.window_size = window_size;
	this.num_players = num_players;
	this.finished = false;

	this.selector = null;
	this.texts = [];
}


/**
 * `Start.setup` initializes the start screen.
 */
Start.prototype.setup = function() {
	this.finished = false;

	this.texts = [];

	// TODO: Add some kind of logo or the like

	// Selector

	// TODO: Align the selector to the window size.

	this.selector = new GUI_Element(300, 200, 'selector');
	this.selector.y = 200 + this.selector.h * this.num_players;

	this.texts.push(new Text('One player', 305 + this.selector.w, 224 + this.selector.h, Infinity));
	this.texts.push(new Text('Two players', 305 + this.selector.w, 224 + this.selector.h * 2, Infinity));
};


/**
 * `Start.handle_input` handles input. (- sincerely, Captain Obvious :) )
 * @param {number} dt - The time delta since last update in seconds
 */
Start.prototype.handle_input = function(dt) {
	if(input.is_down('UP0') || input.is_down('UP1')) {
		input.reset('UP0');
		input.reset('UP1');
		this.select_next(-1);
	}
	else if(input.is_down('DOWN0') || input.is_down('DOWN1')) {
		input.reset('DOWN0');
		input.reset('DOWN1');
		this.select_next(1);
	}

	if(input.is_down('SPACE') || input.is_down('ENTER')) {
		input.reset('SPACE');
		input.reset('ENTER');
		this.finished = true;
	}
}


/**
 * `Start.update` checks if the next stage can be called.
 * @param {number} dt - The time delta since last update in seconds
 */
Start.prototype.update = function(dt) {
	if(this.finished) {
		return {
			next_stage: 'game',
			num_players: this.num_players,
		};
	}
	else {
		return null;
	}
};


/**
 * `Start.select_next` Selects the next menu point.
 * @param {number} direction - If 1, select the next, if -1, select the previous item
 */
Start.prototype.select_next = function(direction) {
	// I currently don't need the direction, but I'll keep it in the code in
	// case, the selection gets more sophisticated than just switching between
	// one or two players.
	this.num_players = this.num_players === 1 ? 2: 1;

	this.selector.y = 200 + this.selector.h * this.num_players;
};


/**
 * `Start.get_entities` returns all entities for the screen to draw.
 * @returns {Object[]} An array with all entities
 */
Start.prototype.get_entities = function() {
	return [this.selector];
};


/**
 * `Start.get_texts` returns all text elements for the screen to draw.
 * @returns {Text[]} An array with all text elements
 */
Start.prototype.get_texts = function() {
	return this.texts;
};


export {Start};
