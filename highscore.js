'use strict';

import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


/**
 * <tt>Highscore</tt> is the highscore screen.
 *
 * @constructor
 * @param {object} window_size
 * 		The window size
 * @param {number} window_size.w
 * 		Width in pixels
 * @param {number} window_size.h
 * 		Height in pixels
 * @param {number[]} scores
 * 		The final scores of the player(s). Should contain one or two numbers.
 * @param {number} level
 * 		The level that was reached
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
 * <tt>Highscore.setup</tt> initializes the highscore screen.
 */
Highscore.prototype.setup = function() {
	this.finished = false;

};


/**
 * <tt>Highscore.handle_input</tt> handles input.
 *
 * @param {number} dt - The time delta since last update in seconds
 */
Highscore.prototype.handle_input = function(dt) {
	if(input.is_down('SPACE') || input.is_down('ENTER')) {
		this.finished = true;
	}
}


/**
 * <tt>Highscore.update</tt> checks if the next stage can be called. If so,
 * return an object for the next stage, otherwise return <tt>null</tt>.
 *
 * @param {number} dt - The time delta since last update in seconds
 * @returns {object|null} See description.
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
 * <tt>Highscore.get_entities</tt> returns all entities for the screen to draw.
 *
 * @returns {object[]} An array with all entities (players, enemies, ...)
 */
Highscore.prototype.get_entities = function() {
	return this.entities;
};


/**
 * <tt>Highscore.get_texts</tt> returns all text elements for the screen to draw.
 *
 * @returns {Text[]} An array with all text elements
 */
Highscore.prototype.get_texts = function() {
	return this.texts;
};


export {Highscore};
