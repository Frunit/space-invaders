'use strict';

/**
 * `Text` holds the information for a single piece of text.
 * In contrast to Sprite, Text also keeps its position on the screen.
 * No render function is needed, since nothing has to be processed. Just use the
 * value directly from the object.
 * @constructor
 * @param {string} text - The actual text
 * @param {number} x - The x position of the text
 * @param {number} y - The y position of the text
 * @param {number} duration - How many seconds until the text becomes inactive
 * @param {string} alignment='left' - Text alignment (may be left, right, or center)
 * @param {string} color='#000000' - Text color (may be any HTML color string)
 * @param {number} size=12 - The font size
 * @param {string} family='monospace' - The font family
 */
function Text(text, x, y, duration, alignment='left', color='#000000', size=12, family='monospace') {
	this.text = text;
	this.x = x;
	this.y = y;
	this.duration = duration;
	this.size = size;
	this.family = family;
	this.alignment = alignment;
	this.color = color;

	this.active = true;
}


/**
 * `Text.update` sets the text to inactive if enough time has passed.
 * @param {number} dt - The time delta since last update in seconds
 */
Text.prototype.update = function(dt) {
	this.duration -= dt;

	if(this.duration <= 0) {
		this.active = false;
	}
};


/**
 * `Text.set_score` is a conveniance function to format and set the score. It
 * turns the integer to a string and left-pads it with zeros.
 * @param {number|string} score - The score to save
 */
Text.prototype.set_score = function(score) {
	this.text = String(score).padStart(6, '0');
};


export {Text};