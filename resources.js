'use strict';

// TODO: Could be rewritten with a Promise instead of callback


/**
 * `Resources` keeps all resources needed in the game (currently only images).
 * It loads everything and calls the callback as soon as everything loaded.
 * @constructor
 */
function Resources() {
	this.resource_cache = {};
	this.ready_callback = () => {};
	this.loaded = 0;
	this.expected = 0;
}


/**
 * `Resources.load` loads all images given in the array of urls.
 * @param {string[]} urls - The list of urls to load.
 */
Resources.prototype.load = function load(urls) {
	urls.forEach((url) => this._load(url));
};


/**
 * `Resources.get` returns the image object for the given url or `undefined` if
 * the image was never requested or `false` if the image was requested but did
 * not finish loading.
 * @param {string} url - The url of the image to get
 * @returns {Object|undefined|boolean} The image object or undefined or false (see description)
 */
Resources.prototype.get = function(url) {
	return this.resource_cache[url];
};


/**
 * `Resources.on_ready` sets the callback function that shall be called when all
 * images were loaded.
 * @param {function} The function to be called when all images were loaded
 */
Resources.prototype.on_ready = function(func) {
	this.ready_callback = func;
};


/**
 * `Resources._load` loads a given image.
 * If the loaded image was the last image in the list of images to be loaded,
 * the `ready_callback` is called
 * @private
 * @param {string} url - The url of the image to load
 */
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


/**
 * `Resources._is_ready` checks whether all images were loaded.
 * @private
 * @returns {boolean} True if everything loaded, false if not
 */
Resources.prototype._is_ready = function() {
	return this.loaded === this.expected;
};


/**
 * `Fake_Resources` pretends to load all needed resources.
 * It will call the callback as soon as everything is "loaded".
 * @constructor
 */
function Fake_Resources() {
	this.resource_cache = {};
	this.ready_callback = () => {};
}


/**
 * `Fake_Resources.load` "loads" all images given in the array of urls.
 * @param {string[]} urls - The list of urls to load.
 */
Fake_Resources.prototype.load = function(urls) {
	for(let url of urls) {
		this.resource_cache[url] = url;
	}
};


/**
 * `Fake_Resources.get` returns the string of the given url or `undefined` if
 * the image was never requested.
 * @param {string} url - The url of the image to get
 * @returns {string|boolean} The url or false (see description)
 */
Fake_Resources.prototype.get = function(url) {
	return this.resource_cache[url]
};


/**
 * `Fake_Resources.on_ready` sets the callback function that shall be called
 * when all images were "loaded".
 * @param {function} The function to be called when all images were "loaded"
 */
Fake_Resources.prototype.on_ready = function(func) {
	this.ready_callback = func;
};


// This exports a different Input depending on whether the script runs in a
// browser or not. This is used for testing in node.js.
const exported_class = typeof window === 'undefined' ? Fake_Resources : Resources;
export default exported_class;
