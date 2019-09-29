'use strict';

/* global input */

import {Input} from '../input.js';
import {Highscore} from '../highscore.js';
import {Start} from '../start.js';
import {Engine} from '../engine.js';
import {Resources} from '../resources.js';

// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png',
	'gfx/keys.png'
]);

global.input = new Input();


QUnit.test('Input in Highscore', function(assert) {
	input.reset();
	const hs = new Highscore({w: 900, h: 600}, [20, 40], 3, new Date());
	hs.setup();

	let ret;

	ret = hs.update(0.1);
	assert.strictEqual(ret, null, 'return is null');

	input.set_key(' ', true);

	assert.ok(!hs.finished, 'Highscore not finished');
	hs.handle_input();
	assert.ok(hs.finished, 'Highscore finished');
	ret = hs.update(0.1);
	assert.ok(ret.next_stage !== null, 'return is not null');
	assert.strictEqual(ret.next_stage, 'start', 'return is next stage');
	assert.deepEqual(input.pressed_keys, {}, 'Input is resetted');
});


QUnit.test('Input in Start', function(assert) {
	input.reset();
	const start = new Start({w: 900, h: 600}, 0, 'VERSION');
	start.setup();

	let ret;

	ret = start.update(0.1);
	assert.strictEqual(ret, null, 'return is null');

	assert.strictEqual(start.num_players, 1, 'Initially one player');

	input.set_key('w', true);
	start.handle_input();
	assert.deepEqual(input.pressed_keys, {}, 'Input is resetted w');
	assert.strictEqual(start.num_players, 2, 'Two players after w');

	input.set_key('ArrowDown', true);
	start.handle_input();
	assert.deepEqual(input.pressed_keys, {}, 'Input is resetted ArrowDown');
	assert.strictEqual(start.num_players, 1, 'One player after ArrowDown');

	input.set_key('KeyW', true);
	input.set_key('KeyS', true);
	start.handle_input();
	assert.deepEqual(input.pressed_keys, {}, 'Input is resetted double key');
	assert.strictEqual(start.num_players, 2, 'Two players after double key');

	input.set_key('Enter', true);
	assert.ok(!start.finished, 'Start not finished');
	start.handle_input();
	assert.ok(start.finished, 'Start finished');
	ret = start.update(0.1);
	assert.ok(ret.next_stage !== null, 'return is not null');
	assert.strictEqual(ret.next_stage, 'game', 'return is next stage');
	assert.strictEqual(ret.num_players, 2, 'number of players in return');
	assert.deepEqual(input.pressed_keys, {}, 'Input is resetted space');
});


QUnit.test('Input in Engine 1 player', function(assert) {
	input.reset();
	const engine = new Engine({w: 900, h: 600}, 20, 1, [{fort: ['X'], forts: 1, enemies: ['012']}], 0);
	engine.setup();

	engine.update(0.1);

	assert.strictEqual(engine.players[0].firing, false, 'Initial firing');
	assert.strictEqual(engine.players[0].moving, 0, 'Initial moving');

	input.set_key(' ', true);
	input.set_key('KeyA', true);
	input.set_key('d', true);
	input.set_key('ArrowRight', true);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, true, '1st firing');
	assert.strictEqual(engine.players[0].moving, -1, '1st moving');

	input.set_key('Space', false);
	input.set_key('a', false);
	input.set_key('ArrowUp', true);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, true, '2nd firing');
	assert.strictEqual(engine.players[0].moving, 1, '2nd moving');

	input.set_key('ArrowUp', false);
	input.set_key('KeyD', false);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, false, '3rd firing');
	assert.strictEqual(engine.players[0].moving, 1, '3rd moving');

	input.reset();
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, false, '4th firing');
	assert.strictEqual(engine.players[0].moving, 0, '4th moving');
});


QUnit.test('Input in Engine 2 players', function(assert) {
	input.reset();
	const engine = new Engine({w: 900, h: 600}, 20, 2, [{fort: ['X'], forts: 1, enemies: ['012']}], 0);
	engine.setup();

	engine.update(0.1);

	assert.strictEqual(engine.players[0].firing, false, 'Initial firing 1');
	assert.strictEqual(engine.players[1].firing, false, 'Initial firing 2');
	assert.strictEqual(engine.players[0].moving, 0, 'Initial moving 1');
	assert.strictEqual(engine.players[1].moving, 0, 'Initial moving 2');

	input.set_key(' ', true);
	input.set_key('KeyA', true);
	input.set_key('d', true);
	input.set_key('ArrowRight', true);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, true, '1st firing 1');
	assert.strictEqual(engine.players[1].firing, false, '1st firing 2');
	assert.strictEqual(engine.players[0].moving, -1, '1st moving 1');
	assert.strictEqual(engine.players[1].moving, 1, '1st moving 2');

	input.set_key('Space', false);
	input.set_key('a', false);
	input.set_key('ArrowUp', true);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, false, '2nd firing 1');
	assert.strictEqual(engine.players[1].firing, true, '2nd firing 2');
	assert.strictEqual(engine.players[0].moving, 1, '2nd moving 1');
	assert.strictEqual(engine.players[1].moving, 1, '2nd moving 2');

	input.set_key('ArrowLeft', true);
	input.set_key('KeyD', false);
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, false, '3rd firing 1');
	assert.strictEqual(engine.players[1].firing, true, '3rd firing 2');
	assert.strictEqual(engine.players[0].moving, 0, '3rd moving 1');
	assert.strictEqual(engine.players[1].moving, -1, '3rd moving 2');

	input.reset();
	engine.handle_input();

	assert.strictEqual(engine.players[0].firing, false, '4th firing 1');
	assert.strictEqual(engine.players[1].firing, false, '4th firing 2');
	assert.strictEqual(engine.players[0].moving, 0, '4th moving 1');
	assert.strictEqual(engine.players[1].moving, 0, '4th moving 2');
});
