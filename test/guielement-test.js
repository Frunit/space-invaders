'use strict';

import {GUI_Element} from '../guielement.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
	'gfx/keys.png'
]);


QUnit.test('GUI Element', function(assert) {
	let element;

	element = new GUI_Element(400, 1, 'life');

	assert.strictEqual(element.w, 26, 'life width');
	assert.strictEqual(element.h, 22, 'life height');

	element = new GUI_Element(105345, -15684, 'score');

	assert.strictEqual(element.w, 16, 'score width');
	assert.strictEqual(element.h, 22, 'score height');

	element = new GUI_Element(-9.71234, 1.542, 'selector');

	assert.strictEqual(element.w, 60, 'selector width');
	assert.strictEqual(element.h, 32, 'selector height');

	element = new GUI_Element(-9.71234, 1.542, 'keys1');

	assert.strictEqual(element.w, 399, 'keys1 width');
	assert.strictEqual(element.h, 116, 'keys1 height');

	element = new GUI_Element(-9.71234, 1.542, 'keys2');

	assert.strictEqual(element.w, 299, 'keys2 width');
	assert.strictEqual(element.h, 116, 'keys2 height');

	element = new GUI_Element(-9.71234, 1.542, 'enemy1');

	assert.strictEqual(element.w, 32, 'enemy1 width');
	assert.strictEqual(element.h, 32, 'enemy1 height');

	element = new GUI_Element(-9.71234, 1.542, 'enemy2');

	assert.strictEqual(element.w, 44, 'enemy2 width');
	assert.strictEqual(element.h, 32, 'enemy2 height');

	element = new GUI_Element(-9.71234, 1.542, 'enemy3');

	assert.strictEqual(element.w, 48, 'enemy3 width');
	assert.strictEqual(element.h, 32, 'enemy3 height');

	assert.throws(() => {new GUI_Element(100, 100, 'bunny');}, 'Should throw upon unknown element type');
});
