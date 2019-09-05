'use strict';

import Resources from '../resources.js';
import {Goody} from '../entities.js';


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


QUnit.test('Goody initial properties', function(assert) {
	const goody = new Goody(32, 16, {x: 0, y: 64}, 3);
	assert.strictEqual(goody.object, 'goody', 'object name');
	assert.strictEqual(goody.w, 46, 'w');
	assert.strictEqual(goody.h, 22, 'h');
	assert.strictEqual(goody.x, 9, 'x');
	assert.strictEqual(goody.y, 5, 'y');
	assert.ok(goody.active, 'active');
	assert.deepEqual(goody.speed, {x: 0, y: 64}, 'speed');

	assert.throws(() => {new Goody(64, 128, {x: 0, y: 64}, 7);}, 'Should throw upon unknown goody type');
});


QUnit.test('Goody properties after some time', function(assert) {
	const goody = new Goody(32, 16, {x: 0, y: 64}, 3);
	const goody2 = new Goody(32, 48, {x: 0, y: 64}, 3);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	assert.ok(goody.active, 'initial active');

	goody.update(0.5, bounds);
	assert.ok(goody.active, 'active after 0.5 s');
	goody.sprite.idx = 0; // The sprite index changes. This is taken care of here.

	assert.deepEqual(goody, goody2);

	goody.update(8.015624, bounds);
	assert.strictEqual(Math.floor(goody.y), 549, 'y');
	assert.ok(goody.active, 'active after 8.515624 s');

	goody.update(0.000002, bounds);
	assert.strictEqual(Math.floor(goody.y), 550, 'y');
	assert.ok(!goody.active, 'inactive after 8.515626 s');
});
