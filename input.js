'use strict';


/**
 * `Input` tracks the relevant key presses of the user.
 * @constructor
 */
function Input() {
	this.pressed_keys = {};

	document.addEventListener('keydown', function(e) {
		this.set_key(e, true);
	});

	document.addEventListener('keyup', function(e) {
		this.set_key(e, false);
	});
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
		case 'ArrowLeft':
		case 'a':
			key = 'LEFT'; break;
		case 'KeyD':
		case 'ArrowRight':
		case 'd':
			key = 'RIGHT'; break;
		/*case 'KeyW':
		case 'ArrowUp':
		case 'w':
			key = 'UP'; break;
		case 'KeyS':
		case 'ArrowDown':
		case 's':
			key = 'DOWN'; break;*/
	}

	this.pressed_keys[key] = status;
};


/**
 * `Input.is_down` returns whether a certain key was pressed.
 * The given key must be an abstraction understood by this class. Currently,
 * these are:
 * - SPACE, ENTER, ESCAPE, LEFT, RIGHT
 * @param {string} key - The key (or rather, its abstraction) to ask for.
 * @returns {boolean|undefined} True if the key is currently pressed, false or undefined otherwise (undefined if it was never pressed)
 */
Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
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
 * - SPACE, ENTER, ESCAPE, LEFT, RIGHT
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
 * - SPACE, ENTER, ESCAPE, LEFT, RIGHT
 * @param {string} key - The key (or rather, its abstraction) to ask for.
 * @returns {boolean|undefined} True if the key is currently pressed, false or undefined otherwise (undefined if it was never pressed)
 */
Fake_Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
};


// This exports a different Input depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = if(typeof window === 'undefined') ? Fake_Input : Input;
export default exported_class;
