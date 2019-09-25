'use strict';

import {Engine} from '../engine.js';
import {Enemy, Player, Wall, Goody} from '../entities.js';
import {GUI_Element} from '../guielement.js';
import {Text} from '../text.js';
import {Resources} from '../resources.js';


// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
]);


// TODO: ENGINE TESTS:
// TODO: Input handling
// TODO: Player shooting (shot on Wall, Enemy, Mystery, outside borders)


const firetest_level = {fort: ['X'], forts: 2, enemies: ['0']};
const goody_level = {fort: ['XXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXX', 'XXXXXXXXXXXXXXXX'], forts: 1, enemies: ['0']};
const minimal_level = {fort: ['X'], forts: 1, enemies: ['012']};
const small_level = {fort: ['XXX', 'XXX'], forts: 5, enemies: ['00','11','22']};

const inner_bounds = {
	'left': 20,
	'right': 880,
	'top': 20,
	'bottom': 560
};

const outer_bounds = {
	'left': 0,
	'right': 900,
	'top': 0,
	'bottom': 600
};


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
	assert.ok(engine.collider(obj_a, {x: 150, y: 150, w: 0, h: 100, collidable: true}), 'zero width');
	assert.ok(engine.collider(obj_a, {x: 150, y: 150, w: 100, h: 0, collidable: true}), 'zero height');
	assert.ok(engine.collider(obj_a, {x: 150, y: 150, w: 0, h: 0, collidable: true}), 'zero size');
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
	assert.deepEqual(engine.players[0], new Player(450, 580, 0), 'Player 1');

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
	assert.deepEqual(engine.players[0], new Player(300, 580, 0), 'Player 1');
	assert.deepEqual(engine.players[1], new Player(600, 580, 1), 'Player 2');

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

	// Shooting on the player

	bullets = engine.enemies[0].fire(1);
	engine.enemy_bullets.push(bullets[0]);
	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'initial GUI player lives');

	// cooldown prevents other bullets for 2 seconds

	for(let i = 0; i < 16; i++) {
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

	for(let i = 0; i < 2; i++) {
		engine.update(0.1);
		bullets = engine.enemies[0].fire(1);
		assert.strictEqual(bullets.length, 0, `Cooldown prevents firing ${i+17} ds`);
	}

	engine.update(0.1);

	// Shooting on the fort/wall

	bullets = engine.enemies[0].fire(1);
	assert.strictEqual(bullets.length, 1, 'New bullet fired 2 s');
	engine.enemy_bullets.push(bullets[0]);

	for(let i = 0; i < 14; i++) {
		engine.update(0.1);
		assert.strictEqual(engine.enemy_bullets.length, 1, `one shot fired ${i+21} ds`);
		assert.ok(engine.walls[0].collidable, `Wall not hit ${i+21} ds`);
	}

	engine.update(0.1);
	assert.strictEqual(engine.enemy_bullets.length, 0, 'Bullet disappears 3.5 s');
	assert.ok(!engine.walls[0].collidable, 'Wall hit 3.5 s');
	// The flying piece of wall is guaranteed to leave the game latest after 1.8 s
	// So it should be removed latest at 5.3 s

	bullets = engine.enemies[0].fire(1);
	assert.strictEqual(bullets.length, 0, 'Cooldown prevents firing 3.5 s');

	for(let i = 0; i < 4; i++) {
		engine.update(0.1);
		bullets = engine.enemies[0].fire(1);
		assert.strictEqual(bullets.length, 0, `Cooldown prevents firing ${i+36} ds`);
	}
	engine.update(0.1);

	// Shooting to the void

	bullets = engine.enemies[0].fire(1);
	assert.strictEqual(bullets.length, 1, 'New bullet fired 4 s');
	engine.enemy_bullets.push(bullets[0]);

	for(let i = 0; i < 18; i++) {
		engine.update(0.1);
		assert.strictEqual(engine.enemy_bullets.length, 1, `one shot fired ${i+40} ds`);
	}

	engine.update(0.1);
	assert.strictEqual(engine.enemy_bullets.length, 0, 'Bullet disappears 5.9 s');

	assert.strictEqual(engine.walls.length, 1, 'Num of walls at the end');
	assert.strictEqual(engine.players[0].lives, 2, 'Player not killed underways');
	assert.strictEqual(engine.enemies.length, 1, 'Num of enemies at the end');
});


QUnit.test('Engine applying goodies', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 1, [goody_level], 0);

	engine.setup();

	const goody_x = 450; // center
	const goody_y = engine.players[0].y - 20; // some pixels above player

	// life (1)

	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'initial GUI player lives');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 1));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'life goody 0.2 s');
	assert.deepEqual(engine.texts.player_lives[0], new Text(4, 36, 30), 'GUI player lives after extra life');

	// score (6)

	assert.deepEqual(engine.texts.player_scores[0], new Text('000000', 116, 30), 'initial GUI player score');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 6));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'coin goody 0.2 s');
	assert.deepEqual(engine.texts.player_scores[0], new Text('000300', 116, 30), 'GUI player score after coin');

	// invulnerability (2)

	assert.strictEqual(engine.players[0].invulnerable, 0, 'initial invulnerability');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 2));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'inv. goody 0.2 s');
	assert.strictEqual(engine.players[0].invulnerable, 7, 'invulnerability after goody');

	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 0)); // kill
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'inv. killer goody 0.2 s');
	assert.deepEqual(engine.texts.player_lives[0], new Text(4, 36, 30), 'GUI player lives inv.');

	// speed-up (3)

	assert.strictEqual(engine.players[0].speed.x, 128, 'initial speed x');
	assert.strictEqual(engine.players[0].speed_up, 0, 'initial speedup');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 3));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'speed goody 0.2 s');
	assert.strictEqual(engine.players[0].speed.x, 256, 'speed x changes after first goody');
	assert.strictEqual(engine.players[0].speed_up, 7, 'speedup after first goody');

	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 3));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'speed goody 0.2 s');
	assert.strictEqual(engine.players[0].speed.x, 256, 'speed x no change after second goody');
	assert.strictEqual(engine.players[0].speed_up, 13.8, 'speedup after second goody');

	// double laser (4)

	assert.strictEqual(engine.players[0].double_laser, 0, 'initial double laser');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 4));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'double laser goody 0.2 s');
	assert.strictEqual(engine.players[0].double_laser, 7, 'double laser after goody');

	// rapid fire (5)

	assert.strictEqual(engine.players[0].rapid_fire, 0, 'initial rapid fire');
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 5));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'rapid fire goody 0.2 s');
	assert.strictEqual(engine.players[0].rapid_fire, 7, 'rapid fire after goody');

	// kill (0)

	engine.update(6); // To remove invulnerability
	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 0));
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 0, 'killer goody 0.2 s');
	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'GUI player lives after kill');

	engine.goodies.push(new Goody(goody_x, goody_y, {x: 0, y: 64}, 1)); // life
	engine.update(0.2);
	assert.strictEqual(engine.goodies.length, 1, 'second goody should not collide');
	assert.deepEqual(engine.texts.player_lives[0], new Text(3, 36, 30), 'GUI player lives after second goody');
});


QUnit.test('Engine player death', function(assert) {
	const engine = new Engine({w: 900, h: 600}, 20, 2, [firetest_level, goody_level], 0);

	engine.setup();

	engine.players[0].lives = 0;
	engine.players[1].lives = 0;

	assert.strictEqual(engine.walls.length, 2, 'walls as indicator of loaded level');

	assert.strictEqual(engine.players[0].w, 60, 'player 1 visible');
	assert.ok(engine.players[0].collidable, 'player 1 interactable');

	assert.strictEqual(engine.level_num, 0, 'starting in level 0');

	engine.apply_goody(0, engine.players[0]); // kill player 1

	assert.strictEqual(engine.players[0].lives, -1, 'killed player 1');
	assert.deepEqual(engine.texts.player_lives[0], new Text(0, 36, 30), 'GUI should show 0, not -1');

	engine.update(0.1);

	assert.strictEqual(engine.enemies.length, 1, 'one enemy present');

	engine.enemies[0].kill();
	engine.update(1.91);

	assert.strictEqual(engine.players[0].off_time, Infinity, 'player 1 off_time after 2.01 s');
	assert.strictEqual(engine.players[0].lives, -1, 'player 1 dead after 2.01 s');
	assert.strictEqual(engine.enemies.length, 1, 'one enemy present after 2.01 s');
	assert.strictEqual(engine.players[0].w, 0, 'player 1 invisible after 2.01 ');
	assert.ok(!engine.players[0].collidable, 'player 1 not interactable after 2.01 ');

	engine.update(0.1); // only enemy is killed; next_level() ist called

	assert.strictEqual(engine.level_num, 1, 'now level 1');

	assert.strictEqual(engine.players[0].off_time, Infinity, 'player 1 off_time in next level');
	assert.strictEqual(engine.players[0].lives, -1, 'player 1 still dead');
	assert.strictEqual(engine.players[0].w, 0, 'player 1 still invisible');
	assert.ok(!engine.players[0].collidable, 'player 1 still not interactable');

	assert.strictEqual(engine.walls.length, 64, 'walls as indicator of newly loaded level');

	engine.apply_goody(0, engine.players[1]); // kill player 2
	let res = engine.update(1.91);

	assert.strictEqual(res, null, 'engine still running 1');

	res = engine.update(0.1);
	assert.strictEqual(res, null, 'engine still running 2');

	res = engine.update(0.1);

	const expected_return = {next_stage: 'highscore', scores: [0, 0], level: 1};

	assert.deepEqual(res, expected_return, 'engine not running anymore');
});


//~ QUnit.test('Engine player shooting', function(assert) {
	//~ const engine = new Engine({w: 900, h: 600}, 20, 1, [firetest_level], 0);
	//~ engine.setup();


//~ });
