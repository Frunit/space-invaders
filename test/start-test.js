'use strict';

import {Start} from '../start.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
	'gfx/keys.png'
]);


// TODO: Start tests


QUnit.test('Start', function(assert) {
	const start = new Start({w: 900, h: 600}, 1, 'VERSION');
	assert.ok(true, 'dummy');
});
