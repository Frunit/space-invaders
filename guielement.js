'use strict';


import {Sprite} from './sprite.js';


/**
 * <tt>GUI_Element</tt> is an object for a gui element holding a sprite.
 *
 * @constructor
 * @param {number} x
 * 		The x coordinate (from left) of the object pointing to its upper left
 * 		corner
 * @param {number} y
 * 		The y coordinate (from top) of the object pointing to its upper left
 * 		corner
 * @param {string} type
 * 		The type of the element. life, selector, or selector
 */
function GUI_Element(x, y, type) {
	switch(type) {
		case 'life': {
			// TODO: Must add sprite for this!
			this.w = 16;
			this.h = 16;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 152, y: 36}, [{x: 0, y: 0}]);
			break;
		}
		case 'score': {
			// TODO: Must add sprite for this!
			this.w = 16;
			this.h = 16;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 152, y: 36}, [{x: 0, y: 0}]);
			break;
		}
		case 'selector': {
			this.w = 60;
			this.h = 32;
			this.sprite = new Sprite('sprites.png', {w: this.w, h: this.h}, 0, {x: 0, y: 100}, [{x: 0, y: 0}]);
			break;
		}
		default:
			throw 'Unknown GUI_Element type: ' + type;
	}


	this.x = x;
	this.y = y;
}

export {GUI_Element};
