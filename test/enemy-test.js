'use strict';

import Resources from '../resources.js';
import {Enemy, Bullet} from '../entities.js';


// TODO: Missing test: Killing the enemy (cooldown, off_time, sprite)


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


/*TODO QUnit.test('Enemy movement and bounds', function(assert) {
	const enemy = new Enemy(100, 100);
	const enemy2 = new Enemy(100, 100);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	enemy.move(-100, bounds);

	assert.strictEqual(enemy.x, bounds.left, 'Left bound');

	enemy.move(100000, bounds);
	enemy2.move(7.82, bounds);

	assert.strictEqual(enemy.x + enemy.w, bounds.right, 'Right bound enemy 1');
	assert.strictEqual(enemy2.x + enemy2.w, bounds.right, 'Right bound enemy 2');

	enemy.move(-0.2, bounds);
	enemy.move(-0.3, bounds);
	enemy.move(-0.33, bounds);
	enemy.move(-0.16, bounds);
	enemy.move(-0.26, bounds);
	enemy.move(1, bounds);

	enemy2.move(-0.25, bounds);

	assert.ok(Math.abs(enemy2.x - enemy.x) < 0.00001, 'step-wise vs. absolute movement');
});*/


QUnit.test('Enemy shooting', function(assert) {
	const enemy = new Enemy(500, 300, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	let bullets;

	bullets = enemy.fire(0);
	assert.strictEqual(bullets.length, 1, 'First shot');
	assert.strictEqual(bullets[0].x, 500-bullets[0].w/2, 'Bullet x');
	//TODO:assert.strictEqual(bullets[0].y, 300-8+bullets[0].h/2, 'Bullet y');
	assert.strictEqual(bullets[0].owner, -1, 'Bullet owner');

	enemy.update(0.5, 0.5, 0.5, bounds);

	bullets = enemy.fire(0);
	assert.ok(Math.abs(enemy.cooldown - 0.5) < 0.00001, 'Current cooldown');
	assert.strictEqual(bullets.length, 0, 'Blocked by cooldown');

	enemy.update(0.5, 0.5, 0.5, bounds);

	bullets = enemy.fire(0);
	assert.strictEqual(bullets.length, 1, 'First shot');
	assert.strictEqual(bullets[0].x, 564-bullets[0].w/2, 'Bullet x');
	//TODO:assert.strictEqual(bullets[0].y, 364-8+bullets[0].h/2, 'Bullet y');
	assert.strictEqual(bullets[0].owner, -1, 'Bullet owner');
});
