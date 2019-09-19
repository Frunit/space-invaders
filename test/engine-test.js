'use strict';

import {Engine} from '../engine.js';
import {Enemy, Player, Wall} from '../entities.js';
import {GUI_Element} from '../guielement.js';
import {Text} from '../text.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
]);


// TODO: ENGINE TESTS:
// TODO: Level change
// TODO: Input handling
// TODO: Player shooting (shot on Wall, Enemy, Mystery, outside borders)
// TODO: Player dying
// TODO: Player loosing last life
// TODO: Level setup with two players when one player is dead
// TODO: Game over
// TODO: Wall flying and vanishing (may be part of [Enemy, Player] shooting)
// TODO: Applying goodies
// TODO: Update lives


const firetest_level = {fort: ['X'], forts: 2, enemies: ['0']};
const minimal_level = {fort: ['X'], forts: 1, enemies: ['012']};
const small_level = {fort: ['XXX', 'XXX'], forts: 5, enemies: ['00','11','22']};

const inner_bounds = {
	'left': 20,
	'right': 880,
	'top': 20,
	'bottom': 580
};

const outer_bounds = {
	'left': 0,
	'right': 900,
	'top': 0,
	'bottom': 600
}


QUnit.test('Engine initial values', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [minimal_level], 0);

	assert.ok(!engine.game_is_over, 'game over');

	assert.strictEqual(engine.enemy_direction, -1, 'enemy direction');
	assert.strictEqual(engine.enemy_moves_down, 0, 'enemy moves down');
	assert.strictEqual(engine.enemy_speed_factor, 1, 'enemy speed factor');

	assert.deepEqual(engine.outer_bounds, outer_bounds, 'outer bounds');
	assert.deepEqual(engine.inner_bounds, inner_bounds, 'inner bounds');
});


QUnit.test('Engine collision detection', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [minimal_level], 0);

	const obj_a = {x: 100, y: 100, w: 100, h: 100, collidable: true};

	assert.ok(engine.collider(obj_a, obj_a), 'congruent');
	assert.ok(!engine.collider(obj_a, {x: 300, y: 300, w: 10, h: 10, collidable: true}), 'far away');
	assert.ok(engine.collider(obj_a, {x: 150, y: 150, w: 100, h: 100, collidable: true}), 'partly overlapping');
	assert.ok(!engine.collider(obj_a, {x: 150, y: 150, w: 100, h: 100, collidable: false}), 'not collidable 1');
	assert.ok(!engine.collider({x: 150, y: 150, w: 100, h: 100, collidable: false}, obj_a), 'not collidable 2');
	assert.ok(engine.collider(obj_a, {x: 100, y: 0, w: 100, h: 100, collidable: true}), 'top border');
	assert.ok(engine.collider(obj_a, {x: 200, y: 100, w: 100, h: 100, collidable: true}), 'right border');
	assert.ok(engine.collider(obj_a, {x: 0, y: 100, w: 100, h: 100, collidable: true}), 'left border');
	assert.ok(engine.collider(obj_a, {x: 100, y: 200, w: 100, h: 100, collidable: true}), 'bottom border');
	assert.ok(!engine.collider(obj_a, {x: 150, y: 150, w: 0, h: 100, collidable: true}), 'zero width');
	assert.ok(!engine.collider(obj_a, {x: 150, y: 150, w: 100, h: 0, collidable: true}), 'zero height');
	assert.ok(!engine.collider(obj_a, {x: 150, y: 150, w: 0, h: 0, collidable: true}), 'zero size');
	assert.ok(engine.collider(obj_a, {x: 75, y: 75, w: 150, h: 150, collidable: true}), 'larger');
	assert.ok(engine.collider(obj_a, {x: 125, y: 125, w: 50, h: 50, collidable: true}), 'smaller');
});


QUnit.test('Engine setup', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [minimal_level], 0);

	engine.setup();

	assert.strictEqual(engine.enemy_speed_factor, 1, 'enemy speed factor');

	assert.strictEqual(engine.enemies.length, 3, 'number of enemies');
	assert.deepEqual(engine.enemies[0], new Enemy(360, 50, 0), 'Enemy 1');
	assert.deepEqual(engine.enemies[1], new Enemy(420, 50, 1), 'Enemy 2');
	assert.deepEqual(engine.enemies[2], new Enemy(480, 50, 2), 'Enemy 3');

	assert.strictEqual(engine.walls.length, 1, 'number of walls');
	assert.deepEqual(engine.walls[0], new Wall(442, 514), 'Wall 1');

	assert.strictEqual(engine.players.length, 1, 'number of players');
	assert.deepEqual(engine.players[0], new Player(450, 560, 0), 'Player 1');

	assert.deepEqual(engine.enemy_bullets, [], 'enemy bullets');
	assert.deepEqual(engine.player_bullets, [], 'player bullets');
	assert.deepEqual(engine.goodies, [], 'goodies');

	assert.strictEqual(engine.gui.length, 2, 'GUI length');
	assert.deepEqual(engine.gui[0], new GUI_Element(5, 10, 'life'), 'GUI 1');
	assert.deepEqual(engine.gui[1], new GUI_Element(95, 10, 'score'), 'GUI 2');

	assert.strictEqual(engine.texts.player_scores.length, 1, 'GUI player scores length');
	assert.deepEqual(engine.texts.player_scores[0], new Text('000000', 116, 30), 'GUI player scores');

	assert.strictEqual(engine.texts.player_lives.length, 1, 'GUI player lives length');
	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'GUI player lives');

	assert.strictEqual(engine.texts.level.length, 2, 'GUI level length');
	assert.deepEqual(engine.texts.level[0], new Text('Level ', 450, 30, Infinity, 'right'), 'GUI level 1');
	assert.deepEqual(engine.texts.level[1], new Text(1, 450, 30), 'GUI level 2');

	assert.deepEqual(engine.texts.floating, [], 'GUI floating');
});


QUnit.test('Engine advanced setup', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 2, [minimal_level, small_level], 0);

	engine.setup();

	// Move stuff
	engine.players[0].fire();
	engine.update(1);
	engine.players[0].update(1, inner_bounds);

	// Load a new level with new players and pretend that at was already loaded several times.
	engine.level_num = 7;
	engine.setup(true);

	assert.ok(Math.abs(engine.enemy_speed_factor - 1.99) < 0.00001, 'enemy speed factor');

	assert.strictEqual(engine.enemies.length, 6, 'number of enemies');
	assert.deepEqual(engine.enemies[0], new Enemy(390, 50, 0), 'Enemy 1');
	assert.deepEqual(engine.enemies[1], new Enemy(450, 50, 0), 'Enemy 2');
	assert.deepEqual(engine.enemies[2], new Enemy(390, 100, 1), 'Enemy 3');
	assert.deepEqual(engine.enemies[3], new Enemy(450, 100, 1), 'Enemy 4');
	assert.deepEqual(engine.enemies[4], new Enemy(390, 150, 2), 'Enemy 5');
	assert.deepEqual(engine.enemies[5], new Enemy(450, 150, 2), 'Enemy 6');

	assert.strictEqual(engine.walls.length, 30, 'number of walls');
	assert.deepEqual(engine.walls[0], new Wall(139, 498), 'Wall 1');
	assert.deepEqual(engine.walls[5], new Wall(171, 514), 'Wall 6');
	assert.deepEqual(engine.walls[10], new Wall(298, 514), 'Wall 11');
	assert.deepEqual(engine.walls[15], new Wall(426, 514), 'Wall 16');
	assert.deepEqual(engine.walls[20], new Wall(601, 498), 'Wall 21');
	assert.deepEqual(engine.walls[25], new Wall(728, 498), 'Wall 26');

	assert.strictEqual(engine.players.length, 2, 'number of players');
	assert.deepEqual(engine.players[0], new Player(300, 560, 0), 'Player 1');
	assert.deepEqual(engine.players[1], new Player(600, 560, 1), 'Player 2');

	assert.deepEqual(engine.enemy_bullets, [], 'enemy bullets');
	assert.deepEqual(engine.player_bullets, [], 'player bullets');
	assert.deepEqual(engine.goodies, [], 'goodies');

	assert.strictEqual(engine.gui.length, 4, 'GUI length');
	assert.deepEqual(engine.gui[0], new GUI_Element(5, 10, 'life'), 'GUI 1');
	assert.deepEqual(engine.gui[1], new GUI_Element(95, 10, 'score'), 'GUI 2');
	assert.deepEqual(engine.gui[2], new GUI_Element(869, 10, 'life'), 'GUI 3');
	assert.deepEqual(engine.gui[3], new GUI_Element(805, 10, 'score'), 'GUI 4');

	assert.strictEqual(engine.texts.player_scores.length, 2, 'GUI player scores length');
	assert.deepEqual(engine.texts.player_scores[0], new Text('000000', 116, 30), 'GUI player scores 1');
	assert.deepEqual(engine.texts.player_scores[1], new Text('000000', 800, 30, Infinity, 'right'), 'GUI player scores 2');

	assert.strictEqual(engine.texts.player_lives.length, 2, 'GUI player lives length');
	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'GUI player lives 1');
	assert.deepEqual(engine.texts.player_lives[1], new Text(3, 864, 30, Infinity, 'right'), 'GUI player lives 2');

	assert.strictEqual(engine.texts.level.length, 2, 'GUI level length');
	assert.deepEqual(engine.texts.level[0], new Text('Level ', 450, 30, Infinity, 'right'), 'GUI level 1');
	assert.deepEqual(engine.texts.level[1], new Text(8, 450, 30), 'GUI level 2');

	assert.deepEqual(engine.texts.floating, [], 'GUI floating');
});


QUnit.test('Engine enemy movement', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [minimal_level], 0);

	engine.setup();

	assert.strictEqual(engine.enemies.length, 3, 'number of enemies');
	assert.deepEqual(engine.enemies[0], new Enemy(360, 50, 0), 'Enemy 1');
	assert.deepEqual(engine.enemies[1], new Enemy(420, 50, 1), 'Enemy 2');
	assert.deepEqual(engine.enemies[2], new Enemy(480, 50, 2), 'Enemy 3');

	engine.update(1);
	assert.strictEqual(engine.enemy_direction, -1, 'Enemy direction after 1 s');
	assert.strictEqual(engine.enemy_moves_down, 0, 'Enemy moves down after 1 s');
	assert.strictEqual(engine.enemy_speed_factor, 1, 'Enemy speed factor after 1 s');
	assert.strictEqual(engine.enemies[0].x, 280, 'Enemy 1 x after 1 s');
	assert.strictEqual(engine.enemies[1].x, 334, 'Enemy 2 x after 1 s');
	assert.strictEqual(engine.enemies[2].x, 392, 'Enemy 3 x after 1 s');
	assert.strictEqual(engine.enemies[0].y, 34, 'Enemy 1 y after 1 s');
	assert.strictEqual(engine.enemies[1].y, 34, 'Enemy 2 y after 1 s');
	assert.strictEqual(engine.enemies[2].y, 34, 'Enemy 3 y after 1 s');

	engine.update(4);
	assert.strictEqual(engine.enemy_direction, -1, 'Enemy direction after 5 s');
	assert.strictEqual(engine.enemy_moves_down, 0, 'Enemy moves down after 5 s');
	assert.strictEqual(engine.enemy_speed_factor, 1, 'Enemy speed factor after 5 s');
	assert.strictEqual(engine.enemies[0].x, 24, 'Enemy 1 x after 5 s');
	assert.strictEqual(engine.enemies[1].x, 78, 'Enemy 2 x after 5 s');
	assert.strictEqual(engine.enemies[2].x, 136, 'Enemy 3 x after 5 s');
	assert.strictEqual(engine.enemies[0].y, 34, 'Enemy 1 y after 5 s');
	assert.strictEqual(engine.enemies[1].y, 34, 'Enemy 2 y after 5 s');
	assert.strictEqual(engine.enemies[2].y, 34, 'Enemy 3 y after 5 s');

	engine.update(0.1);
	assert.strictEqual(engine.enemy_direction, 1, 'Enemy direction after 5.1 s');
	assert.strictEqual(engine.enemy_moves_down, 0.1, 'Enemy moves down after 5.1 s');
	assert.strictEqual(engine.enemy_speed_factor, 1.05, 'Enemy speed factor after 5.1 s');
	assert.strictEqual(engine.enemies[0].x, 17.6, 'Enemy 1 x after 5.1 s');
	assert.strictEqual(engine.enemies[1].x, 71.6, 'Enemy 2 x after 5.1 s');
	assert.strictEqual(engine.enemies[2].x, 129.6, 'Enemy 3 x after 5.1 s');
	assert.strictEqual(engine.enemies[0].y, 34, 'Enemy 1 y after 5.1 s');
	assert.strictEqual(engine.enemies[1].y, 34, 'Enemy 2 y after 5.1 s');
	assert.strictEqual(engine.enemies[2].y, 34, 'Enemy 3 y after 5.1 s');

	engine.update(0.05);
	assert.strictEqual(engine.enemy_direction, 1, 'Enemy direction after 5.15 s');
	assert.strictEqual(engine.enemy_moves_down, 0.05, 'Enemy moves down after 5.15 s');
	assert.strictEqual(engine.enemy_speed_factor, 1.05, 'Enemy speed factor after 5.15 s');
	assert.strictEqual(engine.enemies[0].x, 17.6, 'Enemy 1 x after 5.15 s');
	assert.strictEqual(engine.enemies[1].x, 71.6, 'Enemy 2 x after 5.15 s');
	assert.strictEqual(engine.enemies[2].x, 129.6, 'Enemy 3 x after 5.15 s');
	assert.strictEqual(engine.enemies[0].y, 37.36, 'Enemy 1 y after 5.15 s');
	assert.strictEqual(engine.enemies[1].y, 37.36, 'Enemy 2 y after 5.15 s');
	assert.strictEqual(engine.enemies[2].y, 37.36, 'Enemy 3 y after 5.15 s');

	engine.update(0.05);
	assert.strictEqual(engine.enemy_direction, 1, 'Enemy direction after 5.2 s');
	assert.strictEqual(engine.enemy_moves_down, 0, 'Enemy moves down after 5.2 s');
	assert.strictEqual(engine.enemy_speed_factor, 1.05, 'Enemy speed factor after 5.2 s');
	assert.strictEqual(engine.enemies[0].x, 17.6, 'Enemy 1 x after 5.2 s');
	assert.strictEqual(engine.enemies[1].x, 71.6, 'Enemy 2 x after 5.2 s');
	assert.strictEqual(engine.enemies[2].x, 129.6, 'Enemy 3 x after 5.2 s');
	assert.strictEqual(engine.enemies[0].y, 40.72, 'Enemy 1 y after 5.2 s');
	assert.strictEqual(engine.enemies[1].y, 40.72, 'Enemy 2 y after 5.2 s');
	assert.strictEqual(engine.enemies[2].y, 40.72, 'Enemy 3 y after 5.2 s');

	engine.update(0.05);
	assert.strictEqual(engine.enemy_direction, 1, 'Enemy direction after 5.25 s');
	assert.strictEqual(engine.enemy_moves_down, 0, 'Enemy moves down after 5.25 s');
	assert.strictEqual(engine.enemy_speed_factor, 1.05, 'Enemy speed factor after 5.25 s');
	assert.strictEqual(engine.enemies[0].x, 20.96, 'Enemy 1 x after 5.25 s');
	assert.strictEqual(engine.enemies[1].x, 74.96, 'Enemy 2 x after 5.25 s');
	assert.strictEqual(engine.enemies[2].x, 132.96, 'Enemy 3 x after 5.25 s');
	assert.strictEqual(engine.enemies[0].y, 40.72, 'Enemy 1 y after 5.25 s');
	assert.strictEqual(engine.enemies[1].y, 40.72, 'Enemy 2 y after 5.25 s');
	assert.strictEqual(engine.enemies[2].y, 40.72, 'Enemy 3 y after 5.25 s');
});


QUnit.test('Engine enemy fire', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [firetest_level], 0);
	let bullets;

	engine.setup();

	bullets = engine.enemies[0].fire(1);
	engine.enemy_bullets.push(bullets[0]);

	// cooldown prevents other bullets for 2 seconds

	for(let i = 0; i < 15; i++) {
		engine.update(0.1);
		assert.strictEqual(engine.enemy_bullets.length, 1, `one shot fired ${i+1} ds`);
		assert.strictEqual(engine.players[0].lives, 3, `Player not hit ${i+1} ds`);
	}

	engine.update(0.1);
	assert.strictEqual(engine.enemy_bullets.length, 0, 'Bullet disappears 1.6 s');
	assert.strictEqual(engine.players[0].lives, 2, 'Player loses a life 1.6 s');
	assert.deepEqual(engine.texts.player_lives[0], new Text(2, 36, 30), 'GUI player lives 1.6 s');

	bullets = engine.enemies[0].fire(1);
	assert.strictEqual(bullets.length, 0, 'Cooldown prevents firing 1.6 s');

	for(let i = 0; i < 4; i++) {
		engine.update(0.1);
	}

	bullets = engine.enemies[0].fire(1);
	assert.strictEqual(bullets.length, 1, 'New bullet fired 2 s');

	// TODO: Test if bullet disappears when hitting the bottom
	// TODO: Shoot on Wall and test consequences
});
