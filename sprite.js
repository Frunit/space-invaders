'use strict';


function Sprite(url, size, delay=1, offset={x: 0, y: 0}, frames=[{x: 0, y: 0}]) {
	this.pic = resources.get('gfx/' + url);
	this.offset = offset;
	this.size = size;
	this.delay = delay;
	this.frames = frames;
	this.delay_counter = 0;
	this.idx = 0;
	this.fresh = true;
}


Sprite.prototype.update = function() {
	this.delay_counter++;

	if(this.delay_counter >= this.delay) {
		this.delay_counter = 0;
		this.idx++;
	}
};


Sprite.prototype.reset = function() {
	this.idx = 0;
	this.delay_counter = 0;
	this.fresh = true
};


Sprite.prototype.is_new_frame = function() {
	if(this.fresh) {
		this.fresh = false;
		return true;
	}

	return this.delay_counter === 0 && this.frames.length > 1;
};


Sprite.prototype.render = function() {
	const real_idx = this.idx % this.frames.length;
	const frame = this.frames[real_idx];

	return {
		pic: this.pic,
		x: this.offset.x + frame.x,
		y: this.offset.y + frame.y,
		w: this.size.w,
		h: this.size.h,
	};
};
