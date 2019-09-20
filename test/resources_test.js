'use strict';

import {Resources} from '../resources.js';


QUnit.test('Resources', function(assert) {
	const res = new Resources();
	let elem;

	assert.strictEqual(res.loaded, 0, 'expected 0');
	assert.strictEqual(res.expected, 0, 'expected 0');

	res.load(['img1.png']);

	assert.strictEqual(res.loaded, 1, 'expected 1');
	assert.strictEqual(res.expected, 1, 'expected 1');

	elem = res.get('img1.png');
	assert.strictEqual(elem.src, 'img1.png', 'existing element');

	elem = res.get('elusive.png');
	assert.strictEqual(typeof elem, 'undefined', 'undefined element');

	res.load(['elusive.png', 'my super fïøß%.png']);

	elem = res.get('img1.png');
	assert.strictEqual(elem.src, 'img1.png', 'still existing element');

	elem = res.get('elusive.png');
	assert.strictEqual(elem.src, 'elusive.png', 'newly existing element');

	elem = res.get('my super fïøß%.png');
	assert.strictEqual(elem.src, 'my super fïøß%.png', 'weird filename');

	res.load(['phat_🛸👾🌍.png']);

	elem = res.get('phat_🛸👾🌍.png');
	assert.strictEqual(elem.src, 'phat_🛸👾🌍.png', 'UTF8 emojis');

	assert.ok(res._is_ready, 'Internal _is_ready');

	assert.throws(() => {res.load(['ok.png', 'not_ok.jpg'])}, 'Should throw upon unknown file type');
});


QUnit.test('Resources callback', function(assert) {
	assert.expect(2);
	const res = new Resources();

	res.on_ready(
		() => {assert.ok(true, 'callback test');}
	);

	res.load(['img1.png']); // This should run an assertion (1)
	res.load([]);           // This should *not* run an assertion
	res.load(['img2.png']); // This should run an assertion (2)
});
