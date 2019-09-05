'use strict';

import {GUI_Element} from '../guielement.js';


QUnit.test('GUI Element', function(assert) {
	let element;

	element = new GUI_Element(400, 1, 'life');

	assert.strictEqual(element.w, 16, 'life width');
	assert.strictEqual(element.h, 16, 'life height');

	element = new GUI_Element(105345, -15684, 'score');

	assert.strictEqual(element.w, 16, 'score width');
	assert.strictEqual(element.h, 16, 'score height');

	element = new GUI_Element(-9.71234, 1.542, 'selector');

	assert.strictEqual(element.w, 60, 'selector width');
	assert.strictEqual(element.h, 32, 'selector height');

	assert.throws(() => {new GUI_Element(100, 100, 'bunny');}, 'Should throw upon unknown element type');
});
