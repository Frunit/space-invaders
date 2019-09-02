'use strict';

import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


/**
 * `Highscore` is the highscore screen.
 * @constructor
 * @param {Object} window_size - The window size
 * @param {number} window_size.w - Width in pixels
 * @param {number} window_size.h - Height in pixels
 * @param {number[]} scores - The final scores of the player(s). Should contain one or two numbers.
 * @param {number} level - The level that was reached
 */
function Highscore(window_size, scores, level) {
	this.window_size = window_size;
	this.scores = scores;
	this.level = level;

	this.finished = false;

	this.entities = [];
	this.texts = [];
}


/**
 * `Highscore.setup` initializes the highscore screen.
 */
Highscore.prototype.setup = function() {
	this.finished = false;

};


/**
 * `Highscore.handle_input` handles input.
 * @param {number} dt - The time delta since last update in seconds
 */
Highscore.prototype.handle_input = function(dt) {
	if(input.is_down('SPACE') || input.is_down('ENTER')) {
		this.finished = true;
	}
}


/**
 * `Highscore.update` checks if the next stage can be called.
 * @param {number} dt - The time delta since last update in seconds
 */
Highscore.prototype.update = function(dt) {
	if(this.finished) {
		return {
			next_stage: 'start',
			num_players: this.num_players,
		};
	}
	else {
		return null;
	}
};


/**
 * `Highscore.get_entities` returns all entities for the screen to draw.
 * @returns {Object[]} An array with all entities (players, enemies, ...)
 */
Highscore.prototype.get_entities = function() {
	return this.entities;
};


/**
 * `Highscore.get_texts` returns all text elements for the screen to draw.
 * @returns {Text[]} An array with all text elements
 */
Highscore.prototype.get_texts = function() {
	return this.texts;
};


export {Highscore};
