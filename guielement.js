'use strict';

import {sprite_info} from './sprite_info.js';
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
			this.sprite = new Sprite(sprite_info.life);
			this.w = sprite_info.life.size.w;
			this.h = sprite_info.life.size.h;
			break;
		}
		case 'score': {
			this.sprite = new Sprite(sprite_info.score);
			this.w = sprite_info.score.size.w;
			this.h = sprite_info.score.size.h;
			break;
		}
		case 'selector': {
			this.sprite = new Sprite(sprite_info.player);
			this.w = sprite_info.player.size.w;
			this.h = sprite_info.player.size.h;
			break;
		}
		case 'arrow_left': {
			this.sprite = new Sprite(sprite_info.arrow_left);
			this.w = sprite_info.arrow_left.size.w;
			this.h = sprite_info.arrow_left.size.h;
			break;
		}
		case 'arrow_right': {
			this.sprite = new Sprite(sprite_info.arrow_right);
			this.w = sprite_info.arrow_right.size.w;
			this.h = sprite_info.arrow_right.size.h;
			break;
		}
		case 'keys1': {
			this.sprite = new Sprite(sprite_info.keys1);
			this.w = sprite_info.keys1.size.w;
			this.h = sprite_info.keys1.size.h;
			break;
		}
		case 'keys2': {
			this.sprite = new Sprite(sprite_info.keys2);
			this.w = sprite_info.keys2.size.w;
			this.h = sprite_info.keys2.size.h;
			break;
		}
		case 'enemy1': {
			this.sprite = new Sprite(sprite_info.enemy1, 4);
			this.w = sprite_info.enemy1.size.w;
			this.h = sprite_info.enemy1.size.h;
			break;
		}
		case 'enemy2': {
			this.sprite = new Sprite(sprite_info.enemy2, 4);
			this.w = sprite_info.enemy2.size.w;
			this.h = sprite_info.enemy2.size.h;
			break;
		}
		case 'enemy3': {
			this.sprite = new Sprite(sprite_info.enemy3, 4);
			this.w = sprite_info.enemy3.size.w;
			this.h = sprite_info.enemy3.size.h;
			break;
		}
		case 'unfocused': {
			this.sprite = new Sprite(sprite_info.unfocused);
			this.w = sprite_info.unfocused.size.w;
			this.h = sprite_info.unfocused.size.h;
			break;
		}
		default:
			throw 'Unknown GUI_Element type: ' + type;
	}


	this.x = x;
	this.y = y;
}

export {GUI_Element};
