'use strict';

import Resources from '../resources.js';
import {Bullet} from '../entities.js';


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
	let bullet = new Bullet(32, 16, {x: 0, y: 128}, 0);
	assert.strictEqual(bullet.object, 'bullet', 'object name 0');
	assert.strictEqual(bullet.w, 4, 'w 0');
	assert.strictEqual(bullet.h, 16, 'h 0');
	assert.strictEqual(bullet.x, 30, 'x 0');
	assert.strictEqual(bullet.y, 8, 'y 0');
	assert.strictEqual(bullet.score_value, 0, 'score_value 0');

	bullet = new Bullet(0, 0, {x: 0, y: 128}, 1);
	assert.strictEqual(bullet.object, 'bullet', 'object name 1');
	assert.strictEqual(bullet.w, 12, 'w 1');
	assert.strictEqual(bullet.h, 28, 'h 1');
	assert.strictEqual(bullet.x, -6, 'x 1');
	assert.strictEqual(bullet.y, -14, 'y 1');
	assert.strictEqual(bullet.score_value, 0, 'score_value 1');

	bullet = new Bullet(1000, 500, {x: 0, y: 128}, 2);
	assert.strictEqual(bullet.object, 'bullet', 'object name 2');
	assert.strictEqual(bullet.w, 12, 'w 2');
	assert.strictEqual(bullet.h, 28, 'h 2');
	assert.strictEqual(bullet.x, 994, 'x 2');
	assert.strictEqual(bullet.y, 486, 'y 2');
	assert.strictEqual(bullet.score_value, 0, 'score_value 2');

	bullet = new Bullet(100, 100, {x: 0, y: 128}, 2);
	assert.strictEqual(bullet.object, 'bullet', 'object name 3');
	assert.strictEqual(bullet.w, 12, 'w 3');
	assert.strictEqual(bullet.h, 28, 'h 3');
	assert.strictEqual(bullet.x, 94, 'x 3');
	assert.strictEqual(bullet.y, 86, 'y 3');
	assert.strictEqual(bullet.score_value, 0, 'score_value 3');

	assert.throws(() => {new Bullet(100, 100, 4);}, 'Should throw upon unknown bullet type');
});


QUnit.test('Bullet properties after some time', function(assert) {
	const bullet = new Bullet(100, 36, {x: 0, y: 128}, 1);
	const bullet2 = new Bullet(100, 100, {x: 0, y: 128}, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	bullet.update(0.5, bounds);
	// The sprite changes. This is taken care of here.
	bullet.sprite.delay_counter = 0;
	bullet.sprite.idx = 0;

	assert.deepEqual(bullet, bullet2, 'both bullets are the same');

	bullet.update(3.624, bounds);
	assert.strictEqual(Math.floor(bullet.y), 549, 'y after 4.124 s');
	assert.ok(bullet.active, 'active after 4.124 s');

	bullet.update(0.002, bounds);
	assert.strictEqual(Math.floor(bullet.y), 550, 'y after 4.126 s');
	assert.ok(!bullet.active, 'inactive after 4.126 s');

	bullet2.speed.y = -64;

	bullet2.update(1, bounds);
	assert.strictEqual(Math.floor(bullet2.y + bullet2.h), 50, 'y after 1 s');
	assert.ok(bullet2.active, 'active after 1 s');

	bullet2.update(0.00001, bounds);
	assert.strictEqual(Math.floor(bullet2.y + bullet2.h), 49, 'y after 1.00001 s');
	assert.ok(!bullet2.active, 'active after 1.00001 s');
});


QUnit.test('Bullet hit', function(assert) {
	const bullet = new Bullet(100, 36, {x: 0, y: 128}, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	assert.strictEqual(bullet.off_time, -1, 'initial off_time');
	assert.ok(bullet.collidable, 'initial collidable');
	assert.strictEqual(bullet.sprite.delay, 0.1, 'initial Sprite delay');
	assert.strictEqual(bullet.sprite.size.w, 12, 'initial Sprite w');
	assert.strictEqual(bullet.sprite.size.h, 28, 'initial Sprite h');

	bullet.update(0.5, bounds);

	const ret_value = bullet.kill();
	const y = bullet.y;
	assert.strictEqual(ret_value, null, 'kill return value');
	assert.strictEqual(bullet.off_time, 2, 'off_time after kill');
	assert.ok(!bullet.collidable, 'collidable after kill');
	assert.deepEqual(bullet.speed, {x: 0, y: 0}, 'speed after kill');
	assert.strictEqual(bullet.sprite.delay, 0, 'Sprite delay after kill');
	assert.strictEqual(bullet.sprite.size.w, 12, 'Sprite w after kill');
	assert.strictEqual(bullet.sprite.size.h, 24, 'Sprite h after kill');
	assert.ok(bullet.active, 'active after kill');

	bullet.update(1, bounds);
	assert.strictEqual(bullet.off_time, 1, 'off_time after 1 s');
	assert.ok(bullet.active, 'active after 1 s');
	assert.strictEqual(bullet.y, y, 'no change in y after 1 s');

	bullet.update(1, bounds);
	assert.strictEqual(bullet.off_time, 0, 'off_time after 2 s');
	assert.ok(bullet.active, 'active after 2 s');
	assert.strictEqual(bullet.y, y, 'no change in y after 2 s');

	bullet.update(0.00001, bounds);
	assert.ok(Math.abs(bullet.off_time + 0.00001) < 0.000000001, 'off_time after 2.00001 s');
	assert.ok(!bullet.active, 'inactive after 2.00001 s');
	assert.strictEqual(bullet.y, y, 'no change in y after 2.00001 s');
});
