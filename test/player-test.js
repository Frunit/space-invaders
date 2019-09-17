'use strict';

import Resources from '../resources.js';
import {Player, Bullet} from '../entities.js';


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


QUnit.test('Player initial properties', function(assert) {
	let player = new Player(100, 100, 0);
	assert.strictEqual(player.object, 'player', 'object name');
	assert.strictEqual(player.w, 60, 'w');
	assert.strictEqual(player.h, 32, 'h');
	assert.strictEqual(player.x, 70, 'x');
	assert.strictEqual(player.y, 84, 'y');
	assert.deepEqual(player.speed, {x: 128, y: 0}, 'speed');
	assert.deepEqual(player.bullet_offset, {x: 30, y: 0}, 'bullet_offset');
	assert.strictEqual(player.bullet_double_x_offset, 20, 'bullet_double_x_offset');
	assert.deepEqual(player.bullet_speed, {x: 0, y: -300}, 'bullet_speed');
	assert.strictEqual(player.score, 0, 'score');
	assert.strictEqual(player.lives, 3, 'lives');
	assert.strictEqual(player.num, 0, 'player number');
	assert.strictEqual(player.moving, 0, 'moving');
	assert.strictEqual(player.firing, false, 'firing');
});


QUnit.test('Player reset functionality', function(assert) {
	const player = new Player(100, 100, 0);
	const player2 = new Player(100, 100, 0);

	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	player2.apply_rapid_fire();
	player2.apply_invulnerability();
	player2.firing = true;
	player2.update(0.75, bounds);
	player2.kill(); // This should not have an effect, since the player is invulnerable
	player2.kill(true); // This should kill it anyway
	player2.update(4.123, bounds);
	player2.lives++; // This weighs one kill. If the not-forced kill works, deepEqual will be false

	player2.reset();

	assert.deepEqual(player, player2, 'reset');
});


QUnit.test('Player properties after some time', function(assert) {
	const player = new Player(100, 100, 0);
	const player2 = new Player(100, 100, 0);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	player.update(0.5, bounds);
	player.sprite.idx = 0; // The sprite index changes. This is taken care of here.

	assert.deepEqual(player, player2);
});


QUnit.test('Player movement and bounds', function(assert) {
	const player = new Player(100, 100, 0);
	const player2 = new Player(100, 100, 0);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	player.move(-100, bounds);

	assert.strictEqual(player.x, bounds.left, 'Left bound');

	player.move(100000, bounds);
	player2.move(7.82, bounds);

	assert.strictEqual(player.x + player.w, bounds.right, 'Right bound player 1');
	assert.strictEqual(player2.x + player2.w, bounds.right, 'Right bound player 2');

	player.move(-0.2, bounds);
	player.move(-0.3, bounds);
	player.move(-0.33, bounds);
	player.move(-0.16, bounds);
	player.move(-0.26, bounds);
	player.move(1, bounds);

	player2.move(-0.25, bounds);

	assert.ok(Math.abs(player2.x - player.x) < 0.00001, 'step-wise vs. absolute movement');
});


QUnit.test('Player initial position bounds', function(assert) {
	const player = new Player(1000, 1000, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	assert.strictEqual(player.num, 1, 'Player number');
	assert.strictEqual(player.x, 970, 'Initial x');
	assert.strictEqual(player.y, 984, 'Initial y');

	player.move(0, bounds);

	assert.strictEqual(player.x + player.w, bounds.right, 'x after 0 movement');
	// The move method does not care about y, because y is never meant to change.
	// It is assumed to be correctly set up
	assert.strictEqual(player.y, 984, 'y after 0 movement');
});


QUnit.test('Player shooting', function(assert) {
	const player = new Player(500, 300, 0);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	let bullets;

	bullets = player.fire();
	assert.strictEqual(bullets.length, 0, 'First non-shot');

	player.firing = true;
	bullets = player.fire();
	assert.strictEqual(bullets.length, 1, 'First shot');
	assert.strictEqual(bullets[0].x, 500-2, 'Bullet x');
	assert.strictEqual(bullets[0].y, 300-8-16, 'Bullet y');
	assert.strictEqual(bullets[0].owner, 0, 'Bullet owner');

	player.update(0.5, bounds);

	bullets = player.fire();
	assert.ok(Math.abs(player.cooldown - 0.5) < 0.00001, 'Current cooldown');
	assert.strictEqual(bullets.length, 0, 'Blocked by cooldown');

	player.apply_rapid_fire();
	assert.strictEqual(player.cooldown, 0, 'Cooldown reduced by rapid fire');

	bullets = player.fire();
	assert.strictEqual(bullets.length, 1, 'Not blocked anymore');

	bullets = player.fire();
	assert.ok(Math.abs(player.cooldown - 0.3) < 0.00001, 'Initial cooldown');
	assert.strictEqual(bullets.length, 0, 'Blocked by initial cooldown');

	player.update(0.1, bounds);

	bullets = player.fire();
	assert.ok(Math.abs(player.cooldown - 0.2) < 0.00001, 'Cooldown after 0.1 s');
	assert.strictEqual(bullets.length, 0, 'Blocked by cooldown after 0.1 s');

	player.apply_double_laser();

	bullets = player.fire();
	assert.ok(Math.abs(player.cooldown - 0.2) < 0.00001, 'Double current cooldown');
	assert.strictEqual(bullets.length, 0, 'Double blocked by cooldown');

	player.firing = false;
	player.update(0.2, bounds);
	player.firing = true;

	bullets = player.fire();
	assert.strictEqual(bullets.length, 2, 'Double shot');
	assert.strictEqual(bullets[0].x, 500-2-20, 'Bullet 1 x');
	assert.strictEqual(bullets[0].y, 300-8-16, 'Bullet 1 y');
	assert.strictEqual(bullets[0].owner, 0, 'Bullet 1 owner');
	assert.strictEqual(bullets[1].x, 500-2+20, 'Bullet 2 x');
	assert.strictEqual(bullets[1].y, 300-8-16, 'Bullet 2 y');
	assert.strictEqual(bullets[1].owner, 0, 'Bullet 2 owner');
});


QUnit.test('Player sprite changes', function(assert) {
	const player = new Player(200, 500, 0);
	const player2 = new Player(400, 500, 1);
	const player3 = new Player(123, 456, 0);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	assert.deepEqual(player.sprite, player2.sprite, 'p1 and p2 have the same sprite');
	assert.deepEqual(player.sprite, player3.sprite, 'p1 and p3 have the same sprite');

	player.apply_rapid_fire();

	assert.deepEqual(player.sprite, player3.sprite, 'rapid fire does not change the sprite');

	player.apply_double_laser();

	assert.ok(player.sprite.offset.x !== player3.sprite.offset.x || player.sprite.offset.y !== player3.sprite.offset.y, 'double laser changes sprite');

	player2.apply_invulnerability();

	assert.ok(player2.sprite.offset.x !== player3.sprite.offset.x || player2.sprite.offset.y !== player3.sprite.offset.y, 'invulnerability changes sprite');

	player.apply_invulnerability();
	player2.apply_double_laser();

	assert.deepEqual(player.sprite, player2.sprite, 'combination results in same sprite');
	assert.ok(player.sprite.offset.x !== player3.sprite.offset.x || player.sprite.offset.y !== player3.sprite.offset.y, 'combination is not original sprite 1');
	assert.ok(player2.sprite.offset.x !== player3.sprite.offset.x || player2.sprite.offset.y !== player3.sprite.offset.y, 'combination is not original sprite 2');

	player.kill(true); // force kill the player (ignoring invulnerability)

	assert.ok(player.sprite.offset.x !== player2.sprite.offset.x || player.sprite.offset.y !== player2.sprite.offset.y, 'killing changes sprite 1');
	assert.ok(player.sprite.offset.x !== player3.sprite.offset.x || player.sprite.offset.y !== player3.sprite.offset.y, 'killing changes sprite 2');
	assert.strictEqual(player.sprite.frames.length, 2, 'Explosion has two frames');

});


QUnit.test('Player kill', function(assert) {
	const player = new Player(10, 100, 1);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	assert.ok(player.active, 'initial active');
	assert.ok(!player.is_dead, 'initial is_dead');
	assert.ok(player.collidable, 'initial collidable');
	assert.strictEqual(player.cooldown, 0, 'initial cooldown');
	assert.strictEqual(player.off_time, -1, 'initial off_time');
	assert.strictEqual(player.lives, 3, 'initial lives');

	player.kill();

	assert.ok(player.active, 'active after kill');
	assert.ok(!player.is_dead, 'is_dead after kill');
	assert.ok(!player.collidable, 'collidable after kill');
	assert.strictEqual(player.cooldown, 2, 'cooldown after kill');
	assert.strictEqual(player.off_time, 2, 'off_time after kill');
	assert.strictEqual(player.lives, 2, 'lives after kill');

	player.update(1, bounds);

	assert.ok(player.active, 'active after kill');
	assert.ok(!player.is_dead, 'is_dead after 1.0 s');
	assert.ok(!player.collidable, 'collidable after kill after 1.0 s');
	assert.strictEqual(player.cooldown, 1, 'cooldown after 1.0 s');
	assert.strictEqual(player.off_time, 1, 'off_time after 1.0 s');
	assert.strictEqual(player.lives, 2, 'lives after 1.0 s');

	player.update(1, bounds);

	assert.ok(player.active, 'active after kill');
	assert.ok(!player.is_dead, 'is_dead after 2.0 s');
	assert.ok(!player.collidable, 'collidable after kill after 2.0 s');
	assert.strictEqual(player.cooldown, 0, 'cooldown after 2.0 s');
	assert.strictEqual(player.off_time, 0, 'off_time after 2.0 s');
	assert.strictEqual(player.lives, 2, 'lives after 2.0 s');

	player.update(0.0001, bounds);

	assert.ok(player.active, 'active after kill');
	assert.ok(!player.is_dead, 'is_dead after 2.0001 s');
	assert.ok(player.collidable, 'collidable after kill after 2.0001 s');
	assert.strictEqual(player.cooldown, 0, 'cooldown after 2.0001 s');
	assert.strictEqual(player.off_time, -1, 'off_time after 2.0001 s');
	assert.strictEqual(player.lives, 2, 'lives after 2.0001 s');

	player.kill();

	assert.ok(player.active, 'active after 2nd kill');
	assert.ok(!player.is_dead, 'is_dead after 2nd kill');
	assert.ok(!player.collidable, 'collidable after 2nd kill');
	assert.strictEqual(player.cooldown, 2, 'cooldown after 2nd kill');
	assert.strictEqual(player.off_time, 2, 'off_time after 2nd kill');
	assert.strictEqual(player.lives, 1, 'lives after 2nd kill');

	player.update(2.0001, bounds);

	assert.ok(player.active, 'active after 2nd kill after 2.0001 s');
	assert.ok(!player.is_dead, 'is_dead after 2nd kill after 2.0001 s');
	assert.ok(player.collidable, 'collidable after 2nd kill after 2.0001 s');
	assert.strictEqual(player.cooldown, 0, 'cooldown after 2nd kill after 2.0001 s');
	assert.strictEqual(player.off_time, -1, 'off_time after 2nd kill after 2.0001 s');
	assert.strictEqual(player.lives, 1, 'lives after 2nd kill after 2.0001 s');

	player.kill();

	assert.ok(player.active, 'active after 3rd kill');
	assert.ok(!player.is_dead, 'is_dead after 3rd kill');
	assert.ok(!player.collidable, 'collidable after 3rd kill');
	assert.strictEqual(player.cooldown, 2, 'cooldown after 3rd kill');
	assert.strictEqual(player.off_time, 2, 'off_time after 3rd kill');
	assert.strictEqual(player.lives, 0, 'lives after 3rd kill');

	player.update(2.0001, bounds);

	assert.ok(player.active, 'active after 3rd kill after 2.0001 s');
	assert.ok(!player.is_dead, 'is_dead after 3rd kill after 2.0001 s');
	assert.ok(player.collidable, 'collidable after 3rd kill after 2.0001 s');
	assert.strictEqual(player.cooldown, 0, 'cooldown after 3rd kill after 2.0001 s');
	assert.strictEqual(player.off_time, -1, 'off_time after 3rd kill after 2.0001 s');
	assert.strictEqual(player.lives, 0, 'lives after 3rd kill after 2.0001 s');

	player.kill();

	assert.ok(player.active, 'active after 4th kill');
	assert.ok(!player.is_dead, 'is_dead after 4th kill');
	assert.ok(!player.collidable, 'collidable after 4th kill');
	assert.strictEqual(player.cooldown, 2, 'cooldown after 4th kill');
	assert.strictEqual(player.off_time, 2, 'off_time after 4th kill');
	assert.strictEqual(player.lives, -1, 'lives after 4th kill');

	player.update(2.0001, bounds);

	assert.ok(player.active, 'active after 4th kill after 2.0001 s');
	assert.ok(player.is_dead, 'is_dead after 4th kill after 2.0001 s');
	assert.ok(!player.collidable, 'collidable after 4th kill after 2.0001 s');
	assert.strictEqual(player.cooldown, 0, 'cooldown after 4th kill after 2.0001 s');
	assert.strictEqual(player.off_time, Infinity, 'off_time after 4th kill after 2.0001 s');
	assert.strictEqual(player.lives, -1, 'lives after 4th kill after 2.0001 s');
});
