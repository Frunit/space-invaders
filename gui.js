'use strict';

/**
 * `GUI` takes care of displaying all aspects of the game.
 * If the expected_size is too large, all renderings will be scaled down to fit
 * on the screen.
 * @constructor
 * @param {HTMLElement} target - The HTML element to which the canvas shall be attached to. Should normally be a <div>.
 * @param {Object} expected_size - The size of the game space and the expected canvas size.
 */
function GUI(target, expected_size) {
	// Create the canvas
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	target.appendChild(this.canvas);

	this.expected_size = expected_size;
	this.scale = 1;
	this.canvas_pos = null;
	this._set_canvas_size();

	// Disable the right-click context menu in the game
	this.canvas.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		return false;
	});
}


/**
 * `GUI._set_canvas_size` tries to fit the canvas onto screen with the expected
 * size. If the screen is too small, the canvas and all drawings will be scaled
 * down appropriatly to maximized the canvas size.
 * @private
 */
GUI.prototype._set_canvas_size = function() {
	const window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	const window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	const expected_aspect_ratio = this.expected_size.w / this.expected_size.h;
	const window_aspect_ratio = window_width / window_height;

	this.scale = 1;

	if(expected_aspect_ratio > window_aspect_ratio) {
		if(window_width < this.expected_size.w) {
			this.scale = this.expected_size.w / window_width;
		}
	}
	else {
		if(window_height < this.expected_size.h) {
			this.scale = this.expected_size.h / window_height;
		}
	}

	this.canvas.width = this.expected_size.w * this.scale;
	this.canvas.height = this.expected_size.h * this.scale;
	this.canvas_pos = this.canvas.getBoundingClientRect();
};


/**
 * `GUI.render` renders all entities on the screen.
 * @param {Object[]} entities - An array of entities to be drawn/rendered on screen
 * @param {Sprite} entities[].sprite - The sprite of the entity to render
 */
GUI.prototype.render = function(entities) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(let entity of entities) {
		const params = entity.sprite.render();

		this.ctx.drawImage(params.pic,
			params.x, params.y,
			params.w, params.h,
			entity.x * this.scale, entity.y * this.scale,
			params.w * this.scale, params.h * this.scale);
	}
};
