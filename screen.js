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
	const target_element = document.getElementById(target)
	target_element.appendChild(this.canvas);

	this.expected_size = expected_size;
	this.scale = 1;
	this.canvas.width = expected_size.w;
	this.canvas.height = expected_size.h;
	this._set_canvas_size(target_element.clientWidth, target_element.clientHeight);

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
 * @param {number} target_width - The maximum width of the canvas
 * @param {number} target_height - The maximum height of the canvas
 */
Screen.prototype._set_canvas_size = function(target_width, target_height) {
	// MAYBE: Change canvas size upon browser resize
	const expected_aspect_ratio = this.expected_size.w / this.expected_size.h;
	const target_aspect_ratio = target_width / target_height;

	if(expected_aspect_ratio > target_aspect_ratio) {
		this.scale = target_width / this.expected_size.w;
	}
	else {
		this.scale = target_height / this.expected_size.h;
	}

	this.canvas.width = this.expected_size.w * this.scale;
	this.canvas.height = this.expected_size.h * this.scale;
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
	this.ctx.save();
	this.ctx.scale(this.scale, this.scale);
	for(let entity of entities) {
		const params = entity.sprite.render();

		this.ctx.drawImage(params.pic,
			params.x, params.y,
			params.w, params.h,
			entity.x, entity.y,
			params.w, params.h);
	}

	for(let text_group in texts) {
		for(let text of texts[text_group]) {
			this.ctx.save();
			this.ctx.font = `${text.size}px monospace`;
			this.ctx.textAlign = text.alignment;
			this.ctx.fillStyle = text.color;
			this.ctx.fillText(text.text, text.x, text.y);
			this.ctx.restore();
		}
	}
	this.ctx.restore();
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
 * @param {Text[]} texts
 * 		An array of <tt>Texts</tt> to be drawn on screen
 * @returns {Array[]}
 * 		Array of arrays with the parameters that would have been used for
 * 		rendering.
 */
Fake_Screen.prototype.render = function(entities, texts) {
	const render_elements = [];
	for(let entity of entities) {
		const params = entity.sprite.render();

		render_elements.push(['PIC',
			params.pic._src,
			params.x, params.y,
			params.w, params.h,
			entity.x, entity.y,
			params.w, params.h]);
	}


	for(let text_group in texts) {
		for(let text of texts[text_group]) {
			render_elements.push(['TEXT',
				text.text, text.x, text.y,
				text.size, text.alignment, text.color]);
		}
	}

	return render_elements;
};


// This exports a different Screen depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = typeof window === 'undefined' ? Fake_Screen : Screen;
export default exported_class;
