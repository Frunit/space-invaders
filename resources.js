'use strict';

// Could be redone with a Promise instead of callback

function Resources() {
	this.resource_cache = {};
	this.ready_callback = () => {};
	this.loaded = 0;
	this.expected = 0;
}


Resources.prototype.load = function load(urls) {
	urls.forEach((url) => this._load(url));
};


Resources.prototype._load = function(url) {
	if(!this.resource_cache[url]) {
		this.resource_cache[url] = false;
		this.expected++;
		const img = new Image();
		img.onload = () => {
			this.resource_cache[url] = img;
			this.loaded++;

			if(this._is_ready()) {
				this.ready_callback();
			}
		};
		img.src = url;
	}
};


Resources.prototype.get = function(url) {
	return this.resource_cache[url];
};


Resources.prototype._is_ready = function() {
	return this.loaded === this.expected;
};


Resources.prototype.on_ready = function(func) {
	this.ready_callback = func;
};

