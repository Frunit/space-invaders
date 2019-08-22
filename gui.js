'use strict';

function GUI(target, expected_size) {
	// Create the canvas
	this.canvas = document.createElement('canvas');
	this.ctx = this.canvas.getContext('2d');
	target.appendChild(this.canvas);

	this.expected_size = expected_size;
	this.scale = 1;
	this.canvas_pos = null;
	this.set_canvas_size();

	// Disable the right-click context menu in the game
	this.canvas.addEventListener('contextmenu', function(e) {
		e.preventDefault();
		return false;
	});
}


GUI.prototype.set_canvas_size = function() {
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


GUI.prototype.render = function(entities) {
	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	for(let entity of entities) {
		const params = entity.sprite.render();

		this.ctx.drawImage(params.pic,
			params.x, params.y,
			params.w, params.h,
			entity.x * this.scale, entity.y * this.scale,
			params.w * this.scale, params.h * this.scale);
	};
};
