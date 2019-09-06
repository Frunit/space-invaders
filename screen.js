'use strict';

/**
 * <tt>Screen</tt> takes care of displaying all aspects of the game.
 * If the expected_size is too large, all renderings will be scaled down to fit
 * on the screen.
 *
 * @constructor
 * @param {string} target
 * 		The id of the HTML element to which the canvas shall be attached to.
 * 		Should normally refer to a <div>.
 * @param {object} expected_size
 * 		The size of the game space and the expected canvas size.
 */
function Screen(target, expected_size) {
	// Create the canvas
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	document.getElementById(target).appendChild(this.canvas);

	this.expected_size = expected_size;
	this.scale = 1;
	this._set_canvas_size();

	// Disable the right-click context menu in the game
	this.canvas.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		return false;
	});
}


/**
 * <tt>Screen._set_canvas_size</tt> tries to fit the canvas onto screen with the
 * expected size. If the screen is too small, the canvas and all drawings will
 * be scaled down appropriatly to maximized the canvas size.
 *
 * @private
 */
Screen.prototype._set_canvas_size = function() {
	// TODO: set_canvas_size does not seem to work!
	const window_width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	const window_height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

	const expected_aspect_ratio = this.expected_size.w / this.expected_size.h;
	const window_aspect_ratio = window_width / window_height;

	this.scale = 1;

	if(expected_aspect_ratio > window_aspect_ratio) {
		if(window_width < this.expected_size.w) {
			this.scale = window_width / this.expected_size.w;
		}
	}
	else {
		if(window_height < this.expected_size.h) {
			this.scale = window_height / this.expected_size.h;
		}
	}

	this.canvas.width = this.expected_size.w * this.scale;
	this.canvas.height = this.expected_size.h * this.scale;

	this.ctx.scale(this.scale, this.scale);
};


/**
 * <tt>Screen.render</tt> renders all entities on the screen.
 *
 * @param {object[]} entities
 * 		An array of entities to be drawn/rendered on screen
 * @param {Sprite} entities[].sprite
 * 		The sprite of the entity to render
 * @param {Text[]} texts
 * 		An array of <tt>Texts</tt> to be drawn on screen
 */
Screen.prototype.render = function(entities, texts) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(let entity of entities) {
		const params = entity.sprite.render();

		this.ctx.drawImage(params.pic,
			params.x, params.y,
			params.w, params.h,
			entity.x * this.scale, entity.y * this.scale,
			params.w * this.scale, params.h * this.scale);
	}

	for(let text of texts) {
		this.ctx.save();
		this.ctx.font = `${text.size}px ${text.family}`;
		this.ctx.textAlign = text.alignment;
		this.ctx.fillStyle = text.color;
		this.ctx.fillText(text.text, text.x, text.y);
		this.ctx.restore();
	}
};


/**
 * <tt>Fake_Screen</tt> pretends to take care of displaying all aspects of the
 * game. It is meant for testing in a node environment, where no <tt>window</tt>
 * object exists.
 *
 * @constructor
 * @param {HTMLElement} target
 * 		The HTML element to which the canvas shall be attached to. Should
 * 		normally be a <div>.
 * @param {object} expected_size
 * 		The size of the game space and the expected canvas size.
 * @param {number} [scale=1]
 * 		The scale. As the fake Screen does not have access to the window object,
 * 		the scale can be given directly for testing purposes.
 */
function Fake_Screen(target, expected_size, scale=1) {
	this.expected_size = expected_size;
	this.scale = scale;
}


/**
 * <tt>Fake_Screen.render</tt> renders all entities on the screen.
 *
 * @param {object[]} entities
 * 		An array of entities to be drawn/rendered on screen
 * @param {Sprite} entities[].sprite
 * 		The sprite of the entity to render
 * @returns {Array[]}
 * 		Array of arrays with the parameters that would have been used for
 * 		rendering.
 */
Fake_Screen.prototype.render = function(entities) {
	const render_elements = [];
	for(let entity of entities) {
		const params = entity.sprite.render();

		render_elements.push([params.pic,
			params.x, params.y,
			params.w, params.h,
			entity.x * this.scale, entity.y * this.scale,
			params.w * this.scale, params.h * this.scale]);
	}

	return render_elements;
};


// This exports a different Screen depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = typeof window === 'undefined' ? Fake_Screen : Screen;
export default exported_class;
