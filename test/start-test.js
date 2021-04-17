'use strict';

import {Start} from '../start.js';
import {GUI_Element} from '../guielement.js';
import {Text} from '../text.js';
import {Enemy} from '../entities.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
	'gfx/keys.png'
]);


QUnit.test('Start setup', function(assert) {
	const start = new Start({w: 900, h: 600}, 0, 'VERSION');
	assert.strictEqual(start.name, 'start', 'start name');

	start.setup();

	assert.ok(!start.finished, 'finished');
	assert.strictEqual(start.num_players, 1, 'num_players');
	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction');
	assert.deepEqual(start.selector, new GUI_Element(380, 268, 'selector'), 'selector');
	assert.strictEqual(start.texts.fixed.length, 11, 'num of texts');
	assert.deepEqual(start.texts.fixed[0], new Text('One player', 455, 300), 'text 1');
	assert.deepEqual(start.texts.fixed[1], new Text('Two players', 455, 332), 'text 2');
	assert.strictEqual(start.keys.length, 4, 'num of keys');
	assert.strictEqual(start.enemies.length, 9, 'num of enemies');
	assert.deepEqual(start.enemies[0], new Enemy(370, 50, 0), 'enemy 1');
	assert.deepEqual(start.enemies[4], new Enemy(430, 100, 1), 'enemy 5');
	assert.deepEqual(start.enemies[8], new Enemy(490, 150, 2), 'enemy 9');
});


QUnit.test('Start selector', function(assert) {
	const start = new Start({w: 900, h: 600}, 0, 'VERSION');
	start.setup();

	assert.strictEqual(start.num_players, 1, 'num_players');
	start.select_next();
	assert.strictEqual(start.num_players, 2, 'num_players');
	start.select_next();
	assert.strictEqual(start.num_players, 1, 'num_players');
});


QUnit.test('Start enemy movement', function(assert) {
	const start = new Start({w: 900, h: 600}, 2, 'VERSION');
	start.setup();

	assert.strictEqual(start.num_players, 2, 'num_players');
	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction');
	assert.deepEqual(start.selector, new GUI_Element(380, 300, 'selector'), 'selector');
	assert.strictEqual(start.enemies.length, 9, 'num of enemies');
	assert.deepEqual(start.enemies[0], new Enemy(370, 50, 0), 'enemy 1');
	assert.deepEqual(start.enemies[4], new Enemy(430, 100, 1), 'enemy 5');
	assert.deepEqual(start.enemies[6], new Enemy(370, 150, 2), 'enemy 7');
	assert.deepEqual(start.enemies[8], new Enemy(490, 150, 2), 'enemy 9');

	start.update(0.1);

	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction after 0.1 s');
	assert.ok(Math.abs(start.enemies[6].x - 339.6) < 0.000001, 'enemy 7 x after 0.1 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 0.1 s');

	start.update(4.9);

	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction after 5 s');
	assert.ok(Math.abs(start.enemies[6].x - 26) < 0.000001, 'enemy 7 x after 5 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 5 s');

	start.update(0.1);

	assert.strictEqual(start.enemy_direction, 1, 'enemy_direction after 5.1 s');
	assert.ok(Math.abs(start.enemies[6].x - 19.6) < 0.000001, 'enemy 7 x after 5.1 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 5.1 s');

	start.update(0.05);

	assert.strictEqual(start.enemy_direction, 1, 'enemy_direction after 5.15 s');
	assert.ok(Math.abs(start.enemies[6].x - 22.8) < 0.000001, 'enemy 7 x after 5.15 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 5.15 s');

	start.update(10.6);

	assert.strictEqual(start.enemy_direction, 1, 'enemy_direction after 15.75 s');
	assert.ok(Math.abs(start.enemies[6].x - 701.2) < 0.000001, 'enemy 7 x after 15.75 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 15.75 s');

	start.update(0.2);

	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction after 15.95 s');
	assert.ok(Math.abs(start.enemies[6].x - 714) < 0.000001, 'enemy 7 x after 15.95 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 15.95 s');

	start.update(1.05);

	assert.strictEqual(start.enemy_direction, -1, 'enemy_direction after 17 s');
	assert.ok(Math.abs(start.enemies[6].x - 646.8) < 0.000001, 'enemy 7 x after 17 s');
	assert.strictEqual(start.enemies[6].y, 134, 'enemy 7 y after 17 s');
});
