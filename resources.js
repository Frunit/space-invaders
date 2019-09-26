'use strict';

// Fake Image object for use in automated tests in nodejs
if(typeof window === 'undefined') {
	global.Image = class { // eslint-disable-line
		constructor() { // eslint-disable-line
			this._src = '';
			this.onload = () => {};
		}

		set src(url) { // eslint-disable-line
			this._src = url;
			this.onload();
		}

		get src() { // eslint-disable-line
			return this._src;
		}
	};
}


/**
 * <tt>Resources</tt> keeps all resources needed in the game (currently images
 * and fonts). It loads everything and calls the callback as soon as everything
 * loaded.
 *
 * @constructor
 */
function Resources() {
	this.resource_cache = {};
	this.ready_callback = () => {};
	this.loaded = 0;
	this.expected = 0;
}


/**
 * <tt>Resources.load</tt> loads all files given in the array of urls.
 *
 * @param {string[]} urls - The list of urls to load.
 */
Resources.prototype.load = function load(urls) {
	this.expected += urls.length;
	urls.forEach((url) => this._load(url));
};


/**
 * <tt>Resources.get</tt> returns the object for the given url or
 * <tt>undefined</tt> if the resource was never requested or <tt>false</tt> if
 * the resource was requested but did not finish loading.
 *
 * @param {string} url
 * 		The url of the resource to get
 * @returns {object|undefined|boolean}
 * 		The resource object or <tt>undefined</tt> or <tt>false</tt> (see
 * 		description)
 */
Resources.prototype.get = function(url) {
	return this.resource_cache[url];
};


/**
 * <tt>Resources.on_ready</tt> sets the callback function that shall be called
 * when all resources were loaded.
 *
 * @param {Function} func
 * 		The function to be called when all resources were loaded
 */
Resources.prototype.on_ready = function(func) {
	this.ready_callback = func;
};


/**
 * <tt>Resources._load</tt> loads a given resource based on the url.
 * If the loaded resource was the last resource in the list of resources to be
 * loaded, the <tt>ready_callback</tt> is called.
 *
 * @private
 * @param {string} url - The url of the resource to load
 */
Resources.prototype._load = function(url) {
	if(!this.resource_cache[url]) {
		this.resource_cache[url] = false;
		const ext = url.split('.').pop();
		switch(ext) {
			case 'png': {
				const img = new Image();
				img.onload = () => {
					this.resource_cache[url] = img;
					this.loaded++;

					if(this._is_ready()) {
						this.ready_callback();
					}
				};
				img.src = url;
				break;
			}
			default:
				throw 'Unknown file type: ' + url;
		}
	}
};


/**
 * <tt>Resources._is_ready</tt> checks whether all resources were loaded.
 *
 * @private
 * @returns {boolean} <tt>true</tt> if everything loaded, <tt>false</tt> if not
 */
Resources.prototype._is_ready = function() {
	return this.loaded === this.expected;
};

export {Resources};
