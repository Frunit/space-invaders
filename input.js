'use strict';

function Input() {
	this.pressed_keys = {};
}


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


Input.prototype.is_down = function(key) {
	return this.pressed_keys[key];
};

