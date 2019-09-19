'use strict';

import {Highscore} from '../highscore.js';
import {Resources} from '../resources.js';

// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png'
]);


// TODO: Highscore tests


QUnit.test('Highscore', function(assert) {
	const highscore = new Highscore({w: 900, h: 600}, [20, 40], 3, new Date('2019-09-10T00:00:00Z'));
	assert.ok(true, 'dummy');
});
