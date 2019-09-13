'use strict';

import Resources from '../resources.js';
import {Wall} from '../entities.js';


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


QUnit.test('Wall inital properties', function(assert) {
	let wall = new Wall(15236, 6842);
	assert.strictEqual(wall.object, 'wall', 'object name');
	assert.strictEqual(wall.w, 16, 'w');
	assert.strictEqual(wall.h, 16, 'h');
	assert.strictEqual(wall.x, 15228, 'x');
	assert.strictEqual(wall.y, 6834, 'y');
	assert.strictEqual(wall.gravity, 300, 'gravity');
	assert.ok(wall.active, 'active');
	assert.ok(wall.collidable, 'collidable');
	assert.deepEqual(wall.speed, {x: 0, y: 0}, 'speed');
});


QUnit.test('Wall properties after some time', function(assert) {
	const wall = new Wall(99, 48);
	const wall2 = new Wall(99, 48);
	const bounds = {
		left: 50,
		right: 850,
		top: 50,
		bottom: 550,
	};
	assert.ok(wall.active, 'initial active');
	assert.ok(wall.collidable, 'initial collidable');

	wall.update(123.456, bounds);
	wall.sprite.idx = 0; // The sprite index changes. This is taken care of here.
	assert.deepEqual(wall, wall2);

	for(let i = 0; i < 1000; i++) {
		wall.kill();
		assert.ok(wall.speed.x > -60 && wall.speed.x < 60);
		assert.ok(wall.speed.y > -200 && wall.speed.y < 0);
	}

	assert.ok(!wall.collidable, 'wall not collidable after killing');

	wall.speed.x = 30;
	wall.speed.y = -175;

	wall.update(0.1, bounds);
	assert.ok(wall.active, 'active after 0.1 s');
	assert.strictEqual(Math.floor(wall.x), 94, 'x after 0.1 s');
	assert.strictEqual(Math.floor(wall.y), 22, 'y after 0.1 s');
	assert.strictEqual(Math.floor(wall.speed.y), -145, 'speed.y after 0.1 s');

	for(let i = 0; i < 4; i++) {
		wall.update(0.1, bounds);
	}

	assert.ok(wall.active, 'active after 0.5 s');
	assert.strictEqual(Math.floor(wall.x), 106, 'x after 0.5 s');
	assert.strictEqual(Math.floor(wall.y), -18, 'y after 0.5 s');
	assert.strictEqual(Math.floor(wall.speed.y), -25, 'speed.y after 0.5 s');

	for(let i = 0; i < 5; i++) {
		wall.update(0.1, bounds);
	}

	assert.ok(wall.active, 'active after 1 s');
	assert.strictEqual(Math.floor(wall.x), 121, 'x after 1 s');
	assert.strictEqual(Math.floor(wall.y), 0, 'y after 1 s');
	assert.strictEqual(Math.floor(wall.speed.y), 125, 'speed.y after 1 s');

	for(let i = 0; i < 10; i++) {
		wall.update(0.1, bounds);
	}

	assert.ok(wall.active, 'active after 2 s');
	assert.strictEqual(Math.floor(wall.x), 151, 'x after 2 s');
	assert.strictEqual(Math.floor(wall.y), 260, 'y after 2 s');
	assert.strictEqual(Math.floor(wall.speed.y), 425, 'speed.y after 2 s');

	for(let i = 0; i < 6; i++) {
		wall.update(0.1, bounds);
	}

	assert.ok(!wall.active, 'inactive after 3.6 s');
	assert.strictEqual(Math.floor(wall.x), 169, 'x after 3.6 s');
	assert.strictEqual(Math.floor(wall.y), 560, 'y after 3.6 s');
	assert.strictEqual(Math.floor(wall.speed.y), 605, 'speed.y after 3.6 s');
});


QUnit.test('Wall bounds left and right', function(assert) {
	const wall = new Wall(20, 48);
	const wall2 = new Wall(80, 48);
	const bounds = {
		left: 0,
		right: 100,
		top: 0,
		bottom: 1000,
	};

	wall.kill();

	wall.speed.x = -30;
	wall.speed.y = -100;

	wall.update(0.1, bounds);
	assert.ok(wall.active, 'active 1 after 0.1 s');
	assert.strictEqual(Math.floor(wall.x), 9, 'x 1 after 0.1 s');
	assert.strictEqual(Math.floor(wall.y), 30, 'y 1 after 0.1 s');
	assert.strictEqual(Math.floor(wall.speed.y), -70, 'speed.y 1 after 0.1 s');

	for(let i = 0; i < 8; i++) {
		wall.update(0.1, bounds);
	}

	assert.ok(wall.active, 'active 1 after 0.9 s');
	assert.strictEqual(Math.floor(wall.x), -15, 'x 1 after 0.9 s');
	assert.strictEqual(Math.floor(wall.y), 58, 'y 1 after 0.9 s');
	assert.strictEqual(Math.floor(wall.speed.y), 170, 'speed.y 1 after 0.9 s');

	wall.update(0.1, bounds);

	assert.ok(!wall.active, 'inactive 1 after 1.0 s');
	assert.strictEqual(Math.floor(wall.x), -18, 'x 1 after 1.0 s');
	assert.strictEqual(Math.floor(wall.y), 75, 'y 1 after 1.0 s');
	assert.strictEqual(Math.floor(wall.speed.y), 200, 'speed.y 1 after 1.0 s');

	wall2.kill();

	wall2.speed.x = 25;
	wall2.speed.y = -125;

	wall2.update(0.1, bounds);
	assert.ok(wall2.active, 'active 2 after 0.1 s');
	assert.strictEqual(Math.floor(wall2.x), 74, 'x 2 after 0.1 s');
	assert.strictEqual(Math.floor(wall2.y), 27, 'y 2 after 0.1 s');
	assert.strictEqual(Math.floor(wall2.speed.y), -95, 'speed.y 2 after 0.1 s');

	for(let i = 0; i < 10; i++) {
		wall2.update(0.1, bounds);
	}

	assert.ok(wall2.active, 'active 2 after 1.1 s');
	assert.strictEqual(Math.floor(wall2.x), 99, 'x 2 after 1.1 s');
	assert.strictEqual(Math.floor(wall2.y), 67, 'y 2 after 1.1 s');
	assert.strictEqual(Math.floor(wall2.speed.y), 205, 'speed.y 2 after 1.1 s');

	wall2.update(0.1, bounds);

	assert.ok(!wall2.active, 'inactive 2 after 1.2 s');
	assert.strictEqual(Math.floor(wall2.x), 102, 'x 2 after 1.2 s');
	assert.strictEqual(Math.floor(wall2.y), 88, 'y 2 after 1.2 s');
	assert.strictEqual(Math.floor(wall2.speed.y), 235, 'speed.y 2 after 1.2 s');
});
