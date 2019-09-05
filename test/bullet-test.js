'use strict';

import Resources from '../resources.js';
import {Bullet} from '../entities.js';


// TODO: Bullet tests


// This allows the resources to 'load' the graphics and just then start the
// tests. Otherwise, the tests would start automatically and a potential race
// condition might occur.
QUnit.config.autostart = false;

// 'Load' the images. Start the tests when finished.
global.resources = new Resources();
resources.on_ready(() => {QUnit.start()});
resources.load([
	'gfx/sprites.png',
]);


QUnit.test('Bullet', function(assert) {
	let bullet = new Bullet(32, 16, {x: 0, y: 128}, 1);
	assert.strictEqual(bullet.object, 'bullet', 'object name');
});
