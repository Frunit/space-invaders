'use strict';

import Resources from '../resources.js';
import { Player } from '../entities.js';


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


QUnit.test('initial Player properties', function(assert) {
	const player = new Player(100, 100);
	assert.strictEqual(player.w,     60, 'w');
	assert.strictEqual(player.h,     32, 'h');
	assert.strictEqual(player.x,     70, 'x');
	assert.strictEqual(player.y,     84, 'y');
	assert.strictEqual(player.speed, 96, 'speed');
	assert.deepEqual(player.bullet_offset, {x: 30, y: 0}, 'bullet_offset');
	assert.strictEqual(player.bullet_double_x_offset, 20, 'bullet_double_x_offset');
	assert.strictEqual(player.bullet_speed, -300, 'bullet_speed');
	assert.strictEqual(player.score, 0, 'score');
	assert.strictEqual(player.lives, 3, 'lives');
});


QUnit.test('Player reset functionality', function(assert) {
	const player = new Player(100, 100);
	const player2 = new Player(100, 100);

	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};

	player2.rapid_fire += 7;
	player2.make_invulnerable();
	player2.fire();
	player2.update(0.75);
	player2.kill();
	player2.update(4.123);
	player2.lives++;

	player2.reset();

	assert.deepEqual(player, player2, 'reset');
});


QUnit.test('Player properties after some time', function(assert) {
	const player = new Player(100, 100);
	const player2 = new Player(100, 100);

	player.update(0.5);

	// Sprite will change since its also updated. So I have to use this
	// rather complicated setup to test all *other* properties.
	for(let prop in player) {
		if(typeof player[prop] !== 'object') {
			assert.equal(player[prop], player2[prop], prop);
		}
		else if(prop !== 'sprite') {
			assert.deepEqual(player[prop], player2[prop], prop);
		}
	}
});


QUnit.test('Player movement and bounds', function(assert) {
	const player = new Player(100, 100);
	const player2 = new Player(100, 100);
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
