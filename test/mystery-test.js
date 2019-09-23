'use strict';

import {Mystery} from '../entities.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
]);


QUnit.test('Mystery initial values', function(assert) {
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	let mystery;
	mystery = new Mystery(true, bounds);

	assert.strictEqual(mystery.object, 'mystery', 'object name');
	assert.strictEqual(mystery.w, 64, 'w');
	assert.strictEqual(mystery.h, 28, 'h');
	assert.strictEqual(mystery.x, -64, 'x');
	assert.strictEqual(mystery.y, 45, 'y');
	assert.deepEqual(mystery.speed, {x: 96, y: 10}, 'speed');
	assert.strictEqual(mystery.base_y, 45, 'base_y');
	assert.strictEqual(mystery.score_value, 500, 'score_value');

	mystery = new Mystery(false, bounds);

	assert.strictEqual(mystery.object, 'mystery', 'object name');
	assert.strictEqual(mystery.w, 64, 'w');
	assert.strictEqual(mystery.h, 28, 'h');
	assert.strictEqual(mystery.x, 850, 'x');
	assert.strictEqual(mystery.y, 45, 'y');
	assert.deepEqual(mystery.speed, {x: -96, y: 10}, 'speed');
	assert.strictEqual(mystery.base_y, 45, 'base_y');
	assert.strictEqual(mystery.score_value, 500, 'score_value');
});


QUnit.test('Mystery movement', function(assert) {
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	const mystery = new Mystery(true, bounds);

	mystery.update(1, bounds);
	assert.strictEqual(mystery.x, 32, 'x after 1 s');
	assert.ok(Math.abs(mystery.y - 54.99573603041505) < 0.0000001, 'y after 1 s');
	assert.ok(mystery.active, 'active after 1 s');

	mystery.update(3, bounds);
	assert.strictEqual(mystery.x, 320, 'x after 4 s');
	assert.ok(Math.abs(mystery.y - 42.12096683334935) < 0.0000001, 'y after 4 s');
	assert.ok(mystery.active, 'active after 4 s');

	mystery.update(5.5, bounds);
	assert.strictEqual(mystery.x, 848, 'x after 9.5 s');
	assert.ok(Math.abs(mystery.y - 35.00066133741196) < 0.0000001, 'y after 9.5 s');
	assert.ok(mystery.active, 'active after 9.5 s');

	mystery.update(0.1, bounds);
	assert.ok(Math.abs(mystery.x- 857.6) < 0.00000001, 'x after 9.5 s');
	assert.ok(Math.abs(mystery.y - 36.07753013812729) < 0.0000001, 'y after 9.5 s');
	assert.ok(!mystery.active, 'inactive after 9.5 s');
});


QUnit.test('Mystery kill', function(assert) {
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	const mystery = new Mystery(false, bounds);
	const mystery2 = new Mystery(false, bounds);

	assert.ok(mystery.active, 'initial active');
	assert.ok(mystery.collidable, 'initial collidable');
	assert.strictEqual(mystery.off_time, -1, 'initial off_time');
	assert.deepEqual(mystery, mystery2, 'initial values incl sprite');

	mystery.kill();

	assert.ok(mystery.active, 'active after kill');
	assert.ok(!mystery.collidable, 'collidable after kill');
	assert.strictEqual(mystery.off_time, 2, 'off_time after kill');
	assert.ok(mystery.sprite.offset.x !== mystery2.sprite.offset.x || mystery.sprite.offset.y !== mystery2.sprite.offset.y, 'killing changes sprite');
	assert.strictEqual(mystery.x - 6, mystery2.x, 'x changes with sprite change');
	assert.strictEqual(mystery.y - 2, mystery2.y, 'y changes with sprite change');

	mystery.update(1, bounds);

	assert.ok(mystery.active, 'active after 1.0 s');
	assert.ok(!mystery.collidable, 'collidable after 1.0 s');
	assert.strictEqual(mystery.off_time, 1, 'off_time after 1.0 s');
	assert.strictEqual(mystery.x - 6, mystery2.x, 'x must not change when dead after 1.0 s');
	assert.strictEqual(mystery.y - 2, mystery2.y, 'y must not change when dead after 1.0 s');

	mystery.update(1, bounds);

	assert.ok(mystery.active, 'active after 2.0 s');
	assert.ok(!mystery.collidable, 'collidable after 2.0 s');
	assert.strictEqual(mystery.off_time, 0, 'off_time after 2.0 s');
	assert.strictEqual(mystery.x - 6, mystery2.x, 'x must not change when dead after 2.0 s');
	assert.strictEqual(mystery.y - 2, mystery2.y, 'y must not change when dead after 2.0 s');

	mystery.update(0.0001, bounds);

	assert.ok(!mystery.active, 'active after 2.0001 s');
	assert.ok(!mystery.collidable, 'collidable after 2.0001 s');
	assert.ok(mystery.off_time < 0, 'off_time after 2.0001 s');
	assert.strictEqual(mystery.x - 6, mystery2.x, 'x position must not change when dead after 2.0001 s');
	assert.strictEqual(mystery.y - 2, mystery2.y, 'x position must not change when dead after 2.0001 s');
});
