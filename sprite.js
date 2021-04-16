'use strict';

/**
 * <tt>Sprite</tt> holds the information for a single sprite. It takes care of
 * the current position on the sprite sheet, enabling different frames and,
 * hence, animation.
 *
 * @constructor
 * @param {info} object - Information about the sprite
 * @param {string} [info.url='sprites.png'] - The filename of the sprite sheet without path
 * @param {object} info.size - The size of the sprite
 * @param {number} info.size.w - The width of the sprite in pixel
 * @param {number} info.size.h - The height of the sprite in pixel
 * @param {number} [info.delay=1] - The delay between two frames in milliseconds
 * @param {object} info.offset - The offset of the sprite on the sprite sheet
 * @param {number} info.offset.x - The x coordinate (from left) in pixel
 * @param {number} info.offset.y - The y coordinate (from top) in pixel
 * @param {object[]} [info.frames] - The coordinates of the animation frame relativ to the offset
 * @param {number} [info.frames[].x=0] - The x coordinate (from left) in pixel
 * @param {number} [info.frames[].y=0] - The y coordinate (from top) in pixel
 * @param {number} [zoom=1] - Zoom factor for displaying the sprite
 */
function Sprite(info, zoom=1) {
	const url = info.hasOwnProperty('url') ? info.url : 'sprites.png';
	const delay = info.hasOwnProperty('delay') ? info.delay : 1;
	const frames = info.hasOwnProperty('frames') ? info.frames : [{x: 0, y: 0}];

	// add standard path to graphics file name
	this.pic = resources.get('gfx/' + url);

	if(typeof this.pic === 'undefined') {
		throw 'URL not found: gfx/' + url;
	}

	this.offset = info.offset;
	this.size = info.size;
	this.delay = delay;
	this.frames = frames;
	this.delay_counter = 0;
	this.idx = 0;
	this.fresh = true;
	this.zoom = zoom;
}


/**
 * <tt>Sprite.update</tt> updates the current sprite position on the sprite
 * sheet if enough time has passed since the last update.
 *
 * @param {number} dt - The time delta since last update in seconds
 */
Sprite.prototype.update = function(dt) {
	if(this.delay) {
		this.delay_counter += dt;

		if(this.delay_counter >= this.delay) {
			this.idx += Math.floor(this.delay_counter / this.delay);
			this.delay_counter %= this.delay;
			this.fresh = true;
		}
	}
};


/**
 * <tt>Sprite.reset</tt> resets the sprite so it behaves as if it was just
 * created.
 */
Sprite.prototype.reset = function() {
	this.idx = 0;
	this.delay_counter = 0;
	this.fresh = true;
};


/**
 * <tt>Sprite.is_new_frame</tt> Gives information on whether the frame changed
 * since the last update. This can prevent drawing of sprites that did not
 * change. If the frame is new and it was never asked, whether it has changed,
 * it will return <tt>true</tt> (i.e. "yes, the frame changed").
 *
 * @returns {boolean}
 * 		<tt>true</tt> if the frame changed since the last update or if the
 * 		sprite was newly created. <tt>false</tt> otherwise.
 */
Sprite.prototype.is_new_frame = function() {
	if(this.fresh) {
		this.fresh = false;
		return true;
	}

	return false;
};


/**
 * <tt>Sprite.render</tt> returns all necessary information to render the current
 * frame of the sprite.
 *
 * @returns {Renderinfo} The information for rendering
 */
Sprite.prototype.render = function() {
	const real_idx = this.idx % this.frames.length;
	const frame = this.frames[real_idx];

	return {
		pic: this.pic,
		x: this.offset.x + frame.x,
		y: this.offset.y + frame.y,
		w: this.size.w,
		h: this.size.h,
		zoom: this.zoom
	};
};


/**
 * @typedef {object} Renderinfo
 * @property {object} pic - The image object holding the sprite sheet
 * @property {number} x - The x coordinate of the sprite (from left) in pixels
 * @property {number} y - The y coordinate of the sprite (from top) in pixels
 * @property {number} w - The width of the sprite in pixels
 * @property {number} h - The height of the sprite in pixels
 */


export {Sprite};
