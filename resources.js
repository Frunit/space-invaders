'use strict';

// TODO: Could be rewritten with a Promise instead of callback


if(typeof window === 'undefined') {
	global.Image = {
		_src: '',
		onload: () => {},

		set src(url) {
			this._src = url;
			this.onload();
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
		this.expected++;
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
			case 'ttf':
			case 'woff':
			case 'woff2': {
				// The name is the base name,
				// ./path/to/myfont.ttf -> myfont
				let name = url.split('/').pop(); // remove path
				name = name.replace(/\.[^.]+$/, ''); // remove extension
				console.log(name, url);
				const font = new FontFace(name, url);
				font.load().then(
					function(f) {
						document.fonts.add(f);
						this.loaded++;

						if(this._is_ready()) {
							this.ready_callback();
						}
				});
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


/**
 * <tt>Fake_Resources</tt> pretends to load all needed resources.
 * It will call the callback as soon as everything is "loaded".
 * It is meant for testing in a node environment, where no <tt>Image</tt>
 * object exists. As opposed to the "real" Resources, it will *never* call the
 * <tt>ready_callback</tt> set by Fake_Resources.on_ready .
 *
 * @constructor
 */
function Fake_Resources() {
	this.resource_cache = {};
	this.ready_callback = () => {};
}


/**
 * <tt>Fake_Resources.load</tt> "loads" all resources given in the array of urls.
 *
 * @param {string[]} urls - The list of urls to load.
 */
Fake_Resources.prototype.load = function(urls) {
	for(let url of urls) {
		this.resource_cache[url] = url;
	}
};


/**
 * <tt>Fake_Resources.get</tt> returns the string of the given url or
 * <tt>false</tt> if the resources was never requested.
 *
 * @param {string} url - The url of the resource to get
 * @returns {string|boolean} The url or <tt>false</tt> (see description)
 */
Fake_Resources.prototype.get = function(url) {
	return this.resource_cache[url]
};


/**
 * <tt>Fake_Resources.on_ready</tt> sets the callback function that shall be
 * called when all resources were "loaded".
 *
 * @param {Function} func
 * 		The function to be called when all resources were "loaded"
 */
Fake_Resources.prototype.on_ready = function(func) {
	this.ready_callback = func;
};


// This exports a different Input depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = typeof window === 'undefined' ? Fake_Resources : Resources;
export default exported_class;
