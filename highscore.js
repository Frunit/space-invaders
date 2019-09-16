'use strict';

import {GUI_Element} from './guielement.js';
import {Text} from './text.js';


// MAYBE: Allow name instead of date


// The highscore is saved in the `localStorage`. This storage is only available
// in browsers, so this little mock-up is used for testing in node.js.
if(typeof window === 'undefined') {
	global.localStorage = {
		store: {},

		getItem: function(name) {
			if(!(name in this.store)) {
				return null;
			}

			return this.store[name];
		},

		setItem: function(name, content) {
			this.store[name] = content;
		}
	};
}



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
 * 		The final scores of the player(s). Should contain one or two elements.
 * @param {number} level
 * 		The level that was reached
 * @param {Date} date
 * 		The date that shall be used for a new highscore entry
 */
function Highscore(window_size, scores, level, date) {
	this.window_size = window_size;
	this.scores = scores;
	this.level = level + 1;
	this.date = date.toLocaleString('de-DE', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});

	this.finished = false;

	// Default highscore if nothing is saved.
	this.highscore = [
		{'date': '-', 'score': 60},
		{'date': '-', 'score': 50},
		{'date': '-', 'score': 40},
		{'date': '-', 'score': 30},
		{'date': '-', 'score': 20},
		{'date': '-', 'score': 10},
	];

	this.entities = [];
	this.texts = {};
}


/**
 * <tt>Highscore.setup</tt> initializes the highscore screen.
 */
Highscore.prototype.setup = function() {
	this.finished = false;
	this.entities = [];

	const highscore = localStorage.getItem('highscore');
	if(highscore !== null) {
		this.highscore = JSON.parse(highscore);
	}

	for(let score of this.scores) {
		this.add_score(score);
	}

	this.save_highscore();

	// GUI

	this.texts = {
		dates: [],
		scores: [],
		level: [],
		footer: []
	};

	for(let i = 0; i < this.highscore.length; i++) {
		const score = this.highscore[i];
		this.texts.dates.push(new Text(score.date, this.window_size.w * 0.25, 100 + i*30, Infinity));
		this.texts.scores.push(new Text(score.score, this.window_size.w * 0.6, 100 + i*30, Infinity));
		this.texts.scores[i].set_score(score.score); // To ensure the same number of digits
	}

	this.texts.level.push(new Text('You reached level ' + this.level, this.window_size.w / 2, 50, Infinity, 'center'));
	this.texts.footer.push(new Text('Fire to continue', this.window_size.w / 2, this.window_size.h - 50, Infinity, 'center'));
};


/**
 * <tt>Highscore.add_score</tt> adds a score to the existing highscore table in
 * memory. Nothing is changed in the localStorage.
 *
 * @param {number} score - The score to add
 */
Highscore.prototype.add_score = function(score) {
	this.highscore.sort((a, b) => b.score - a.score);
	const l = this.highscore.length;

	for(let i = 0; i < l; i++) {
		if(this.highscore[i].score < score) {
			this.highscore.splice(i, 0, {'date': this.date, 'score': score});
			break;
		}
	}

	if(this.highscore.length > l) {
		this.highscore.pop();
	}
};


/**
 * <tt>Highscore.save_highscore</tt> saves the highscore kept in memory to the
 * localStorage.
 */
Highscore.prototype.save_highscore = function() {
	localStorage.setItem('highscore', JSON.stringify(this.highscore));
};


/**
 * <tt>Highscore.handle_input</tt> handles input.
 *
 * @param {string} key - The key that was pressed
 * @param {boolean} key_down - Whether the key is down or up
 */
Highscore.prototype.handle_input = function(key, key_down) {
	if(!key_down) {
		return;
	}

	switch(key) {
		case 'SPACE':
		case 'ENTER':
		case 'UP0':
		case 'UP1':
			this.finished = true; // This will trigger a stage change upon next update
			break;
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
