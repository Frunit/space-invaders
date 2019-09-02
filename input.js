'use strict';


/**
 * `Input` tracks the relevant key presses of the user.
 * @constructor
 */
function Input() {
	this.pressed_keys = {};
}


/**
 * `Input.set_key` sets or unsets values depending on the key given by the event.
 * The values can represent multiple keys, for example, a key press on the left
 * arrow and on "a" will both set the value "LEFT".
 * @param {event} event - The keydown or keyup event
 * @param {boolean} status - If true, the value will be set, if false, the value will be unset.
 */
Input.prototype.set_key = function(event, status) {
	const code = event.code || event.key;
	let key;

	switch(code) {
		case 'ControlRight':
		case 'Control':
			key = 'CTRL'; break
		case 'ShiftLeft':
		case 'Shift':
			key = 'SHIFT'; break
		case 'Space':
		case 'Spacebar':
		case ' ':
			key = 'SPACE'; break;
		case 'Enter':
			key = 'ENTER'; break;
		case 'Escape':
		case 'Esc':
			key = 'ESCAPE'; break;
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
			key = 'DOWN0'; break;
		case 's':
		case 'ArrowDown':
			key = 'DOWN1'; break;
	}

	this.pressed_keys[key] = status;
};


/**
 * `Input.is_down` returns whether a certain key was pressed.
 * The given key must be an abstraction understood by this class. Currently,
 * these are:
 * - CTRL, SHIFT, SPACE, ENTER, ESCAPE, LEFT[01], RIGHT[01], UP[01], DOWN[01]
 * @param {string} key - The key (or rather, its abstraction) to ask for.
 * @returns {boolean|undefined} True if the key is currently pressed, false or undefined otherwise (undefined if it was never pressed)
 */
Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
};


/**
 * `Input.reset` resets are given key (i.e. marks it as "not pressed").
 * @param {string} key - The key (or rather, its abstraction) to reset.
 */
Input.prototype.reset = function(key) {
	this.pressed_keys[key] = false;
};



/**
 * `Fake_Input` tracks the relevant key presses of the user.
 * @constructor
 */
function Fake_Input() {
	this.pressed_keys = {};
}


/**
 * `Fake_Input.set_key` sets or unsets values depending on the key given.
 * The key must be one of:
 * - CTRL, SHIFT, SPACE, ENTER, ESCAPE, LEFT[01], RIGHT[01], UP[01], DOWN[01]
 * @param {string} key - The name of the key
 * @param {boolean} status - If true, the value will be set, if false, the value will be unset.
 */
Fake_Input.prototype.set_key = function(key, status) {
	this.pressed_keys[key] = status;
};


/**
 * `Fake_Input.is_down` returns whether a certain key was pressed.
 * The given key must be an abstraction understood by this class. Currently,
 * these are:
 * - CTRL, SHIFT, SPACE, ENTER, ESCAPE, LEFT[01], RIGHT[01], UP[01], DOWN[01]
 * @param {string} key - The key (or rather, its abstraction) to ask for.
 * @returns {boolean|undefined} True if the key is currently pressed, false or undefined otherwise (undefined if it was never pressed)
 */
Fake_Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
};


// This exports a different Input depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = typeof window === 'undefined' ? Fake_Input : Input;
export default exported_class;
