'use strict';


/**
 * <tt>Input</tt> tracks the relevant key presses of the user.
 *
 * @constructor
 */
function Input() {
	this.pressed_keys = {};
}


/**
 * <tt>Input.set_key</tt> sets or unsets values depending on the key given by
 * the event. The values can represent multiple keys, for example, a key press
 * on the left arrow and on "a" will both set the value "LEFT".
 *
 * @param {string} code
 * 		The key code of the keyboard event.
 * @param {boolean} status
 * 		If <tt>true</tt>, the value will be set, if <tt>false</tt>, the value
 * 		will be unset.
 */
Input.prototype.set_key = function(code, status) {
	let key;

	switch(code) {
		case 'Space':
		case 'Spacebar':
		case ' ':
			key = 'SPACE'; break;
		case 'Enter':
			key = 'ENTER'; break;
		case 'KeyA':
		case 'a':
			key = 'LEFT0'; break;
		case 'ArrowLeft':
			key = 'LEFT1'; break;
		case 'KeyD':
		case 'd':
			key = 'RIGHT0'; break;
		case 'ArrowRight':
			key = 'RIGHT1'; break;
		case 'KeyW':
		case 'w':
			key = 'UP0'; break;
		case 'ArrowUp':
			key = 'UP1'; break;
		case 'KeyS':
		case 's':
			key = 'DOWN0'; break;
		case 'ArrowDown':
			key = 'DOWN1'; break;
	}

	this.pressed_keys[key] = status;
};


/**
 * <tt>Input.is_down</tt> returns whether a certain key was pressed.
 * The given key must be an abstraction understood by this class. Currently,
 * these are:
 * - SPACE, ENTER, LEFT[01], RIGHT[01], UP[01], DOWN[01]
 *
 * @param {string} key
 * 		The key (or rather, its abstraction) to ask for.
 * @returns {boolean|undefined}
 * 		<tt>true</tt> if the key is currently pressed, <tt>false</tt> or
 * 		<tt>undefined</tt> otherwise (<tt>undefined</tt> if it was never pressed)
 */
Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
};


/**
 * <tt>Input.is_down_arr</tt> returns whether any of a list of keys was pressed.
 * The given keys must be the same as in Input.is_down.
 *
 * @param {string[]} keys
 * 		The keys (or rather, their abstractions) to ask for.
 * @returns {boolean}
 * 		<tt>true</tt> if one of the keys are currently pressed, <tt>false</tt>
 * 		otherwise.
 */
Input.prototype.is_down_arr = function(keys) {
	for(let key of keys) {
		if(this.pressed_keys[key]) {
			return true;
		}
	}
	return false;
};


/**
 * <tt>Input.reset</tt> resets are given key (i.e. marks it as "not pressed").
 *
 * @param {string|undefined} key
 * 		The key (or rather, its abstraction) to reset.
 * 		If no key is given, all keys are resetted.
 */
Input.prototype.reset = function(key) {
	if(key) {
		this.pressed_keys[key] = false;
	}
	else {
		this.pressed_keys = {};
	}
};

export {Input};
