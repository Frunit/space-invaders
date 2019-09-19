'use strict';

import {Mystery} from '../entities.js';


// TODO: Mystery tests


QUnit.test('Mystery', function(assert) {
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	let mystery = new Mystery(true, bounds);

	assert.ok(true, 'dummy');
});
