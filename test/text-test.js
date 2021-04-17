'use strict';

import {Text} from '../text.js';


QUnit.test('Text parameters', function(assert) {
	let text = new Text('', 100, 200, Infinity);

	assert.strictEqual(text.alignment, 'left', 'default value alignment');
	assert.strictEqual(text.color, '#ffffff', 'default value color');
	assert.strictEqual(text.size, 24, 'default value size');
	assert.ok(text.active, 'text is active');

	let text2 = new Text('', 100, 200, Infinity);
	text.update(10);

	assert.deepEqual(text, text2, 'no change in infinitly lasting texts');

	text = new Text('YEAH', 500, 1.234, 2);
	assert.ok(text.active, 'text is active 0s');
	text.update(1);
	assert.ok(text.active, 'text is active 1s');
	text.update(1);
	assert.ok(!text.active, 'text is inactive');
});


QUnit.test('Text score', function(assert) {
	let text = new Text('123456', 100, 200, 2);

	assert.strictEqual(text.text, '123456', 'initial value');

	text.set_score(1);
	assert.strictEqual(text.text, '000001', 'set to small integer');

	text.set_score('2');
	assert.strictEqual(text.text, '000002', 'set to string with number');

	text.set_score('asdf');
	assert.strictEqual(text.text, '00asdf', 'set to string');

	text.set_score(1.234);
	assert.strictEqual(text.text, '01.234', 'set to float');

	text.set_score(987654321);
	assert.strictEqual(text.text, '987654321', 'set to integer longer than padding');

	text.set_score(987654321, 10);
	assert.strictEqual(text.text, '0987654321', 'change padding');

	text.set_score();
	assert.strictEqual(text.text, '000000', 'empty score');

	text.set_score(0, 0);
	assert.strictEqual(text.text, '0', 'empty score without padding');
});
