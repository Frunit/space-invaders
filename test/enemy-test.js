'use strict';

import {Resources} from '../resources.js';
import {Enemy, Bullet} from '../entities.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
]);


QUnit.test('Enemy initial properties', function(assert) {
	let enemy = new Enemy(100, 100, 0);
	assert.strictEqual(enemy.object, 'enemy', 'object name');
	assert.strictEqual(enemy.w, 32, 'w');
	assert.strictEqual(enemy.h, 32, 'h');
	assert.strictEqual(enemy.x, 84, 'x');
	assert.strictEqual(enemy.y, 84, 'y');
	assert.deepEqual(enemy.speed, {x: 64, y: 64}, 'speed');
	assert.deepEqual(enemy.bullet_offset, {x: 16, y: 32}, 'bullet_offset');
	assert.deepEqual(enemy.bullet_speed, {x: 0, y: 300}, 'bullet_speed');
	assert.strictEqual(enemy.score_value, 30, 'score_value');

	enemy = new Enemy(100, 100, 1);
	assert.strictEqual(enemy.object, 'enemy', 'object name');
	assert.strictEqual(enemy.w, 44, 'w');
	assert.strictEqual(enemy.h, 32, 'h');
	assert.strictEqual(enemy.x, 78, 'x');
	assert.strictEqual(enemy.y, 84, 'y');
	assert.deepEqual(enemy.speed, {x: 64, y: 64}, 'speed');
	assert.deepEqual(enemy.bullet_offset, {x: 22, y: 32}, 'bullet_offset');
	assert.deepEqual(enemy.bullet_speed, {x: 0, y: 300}, 'bullet_speed');
	assert.strictEqual(enemy.score_value, 20, 'score_value');

	enemy = new Enemy(100, 100, 2);
	assert.strictEqual(enemy.object, 'enemy', 'object name');
	assert.strictEqual(enemy.w, 48, 'w');
	assert.strictEqual(enemy.h, 32, 'h');
	assert.strictEqual(enemy.x, 76, 'x');
	assert.strictEqual(enemy.y, 84, 'y');
	assert.deepEqual(enemy.speed, {x: 64, y: 64}, 'speed');
	assert.deepEqual(enemy.bullet_offset, {x: 24, y: 32}, 'bullet_offset');
	assert.deepEqual(enemy.bullet_speed, {x: 0, y: 300}, 'bullet_speed');
	assert.strictEqual(enemy.score_value, 10, 'score_value');

	assert.throws(() => {new Enemy(100, 100, 3);}, 'Should throw upon unknown enemy type');
});


QUnit.test('Enemy properties after some time', function(assert) {
	const enemy = new Enemy(68, 100, 1);
	const enemy2 = new Enemy(100, 100, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	enemy.update(300, 0.5, 0, bounds);
	enemy.sprite.idx = 0; // The sprite index changes. This is taken care of here.

	assert.deepEqual(enemy, enemy2);
});


QUnit.test('Enemy movement and bounds', function(assert) {
	const enemy = new Enemy(130, 100, 0);
	const enemy2 = new Enemy(100, 100, 0);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	let reached_border = false;

	reached_border = enemy.update(1, -1, 0, bounds);
	assert.ok(!reached_border, 'Left bound not reached');
	reached_border = enemy.update(1, -0.0001, 0, bounds);
	assert.ok(reached_border, 'Left bound reached');

	reached_border = enemy.update(1, 10, 0, bounds);
	assert.ok(!reached_border, 'Right bound not reached');

	reached_border = enemy.update(1, 2.0001, 0, bounds);
	assert.ok(!reached_border, 'Right bound not reached');

	reached_border = enemy.update(1, 0.0001, 0, bounds);
	assert.ok(reached_border, 'Right bound reached');

	enemy.x = 100;
	enemy2.x = 100;

	enemy.update(1, 0.10001, 0, bounds);
	enemy.update(1, 0.2002, 0, bounds);
	enemy.update(1, 0.303, 0, bounds);
	enemy.update(1, 0.44, 0, bounds);
	enemy.update(1, 0.500005, 0, bounds);

	enemy2.update(1, 1.543215, 0, bounds);

	assert.ok(Math.abs(enemy2.x - enemy.x) < 0.0000001, 'step-wise vs. absolute movement');
});


QUnit.test('Enemy shooting', function(assert) {
	const enemy = new Enemy(500, 300, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	let bullets;

	bullets = enemy.fire(1);
	assert.strictEqual(bullets.length, 1, 'First shot');
	assert.strictEqual(bullets[0].x, 500-bullets[0].w/2, 'Bullet x 1');
	assert.strictEqual(316, bullets[0].y + bullets[0].h/2, 'Bullet y 1');
	assert.strictEqual(bullets[0].owner, -1, 'Bullet owner 1');

	enemy.update(0.5, 0.5, 0.5, bounds);

	bullets = enemy.fire(1);
	assert.ok(Math.abs(enemy.cooldown - 1.5) < 0.00001, 'Current cooldown');
	assert.strictEqual(bullets.length, 0, 'Blocked by cooldown');

	enemy.update(1.5, 0.5, 0.5, bounds);

	bullets = enemy.fire(1);
	assert.strictEqual(bullets.length, 1, 'Second shot');
	assert.strictEqual(bullets[0].x, 564-bullets[0].w/2, 'Bullet x 2');
	assert.strictEqual(380, bullets[0].y + bullets[0].h/2, 'Bullet y 2');
	assert.strictEqual(bullets[0].owner, -1, 'Bullet owner 2');
});


QUnit.test('Enemy kill', function(assert) {
	const enemy = new Enemy(500, 300, 1);
	const enemy2 = new Enemy(500, 300, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	assert.ok(enemy.active, 'initial active');
	assert.ok(enemy.collidable, 'initial collidable');
	assert.strictEqual(enemy.cooldown, 0, 'initial cooldown');
	assert.strictEqual(enemy.off_time, -1, 'initial off_time');

	assert.deepEqual(enemy.sprite, enemy2.sprite, 'initial sprites');
	assert.strictEqual(enemy.x, enemy2.x, 'position must be the same x');
	assert.strictEqual(enemy.y, enemy2.y, 'position must be the same y');

	enemy.kill();

	assert.ok(enemy.active, 'active after kill');
	assert.ok(!enemy.collidable, 'collidable after kill');
	assert.strictEqual(enemy.cooldown, 2, 'cooldown after kill');
	assert.strictEqual(enemy.off_time, 2, 'off_time after kill');
	assert.ok(enemy.sprite.offset.x !== enemy2.sprite.offset.x || enemy.sprite.offset.y !== enemy2.sprite.offset.y, 'killing changes sprite');
	assert.strictEqual(enemy.x + 4, enemy2.x, 'position changes with sprite change');
	assert.strictEqual(enemy.y, enemy2.y, 'position must not change when dead y after kill');

	enemy.update(1, 1, 1, bounds);

	assert.ok(enemy.active, 'active after 1.0 s');
	assert.ok(!enemy.collidable, 'collidable after 1.0 s');
	assert.strictEqual(enemy.cooldown, 1, 'cooldown after 1.0 s');
	assert.strictEqual(enemy.off_time, 1, 'off_time after 1.0 s');
	assert.strictEqual(enemy.x + 4, enemy2.x, 'position must not change when dead x after 1.0 s');
	assert.strictEqual(enemy.y, enemy2.y, 'position must not change when dead y after 1.0 s');

	enemy.update(1, 1, 1, bounds);

	assert.ok(enemy.active, 'active after 2.0 s');
	assert.ok(!enemy.collidable, 'collidable after 2.0 s');
	assert.strictEqual(enemy.cooldown, 0, 'cooldown after 2.0 s');
	assert.strictEqual(enemy.off_time, 0, 'off_time after 2.0 s');
	assert.strictEqual(enemy.x + 4, enemy2.x, 'position must not change when dead x after 2.0 s');
	assert.strictEqual(enemy.y, enemy2.y, 'position must not change when dead y after 2.0 s');

	enemy.update(0.0001, 1, 1, bounds);

	assert.ok(!enemy.active, 'active after 2.0001 s');
	assert.ok(!enemy.collidable, 'collidable after 2.0001 s');
	assert.strictEqual(enemy.cooldown, 0, 'cooldown after 2.0001 s');
	assert.ok(enemy.off_time < 0, 'off_time after 2.0001 s');
	assert.strictEqual(enemy.x + 4, enemy2.x, 'position must not change when dead x after 2.0001 s');
	assert.strictEqual(enemy.y, enemy2.y, 'position must not change when dead y after 2.0001 s');

});
