'use strict';

import Resources from '../resources.js';
import {Wall} from '../entities.js';


// TODO: Wall bounds left and right


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
