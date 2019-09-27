'use strict';

import {Input} from '../input.js';


QUnit.test('Input', function(assert) {
	const input = new Input();

	assert.deepEqual(input.pressed_keys, {}, 'no key pressed at start');

	input.set_key('Space', true);
	assert.ok(input.is_down('SPACE'), 'Space');
	input.set_key('Spacebar', false);
	assert.ok(!input.is_down('SPACE'), 'Spacebar');
	input.set_key(' ', true);
	assert.ok(input.is_down('SPACE'), '[ ]');

	input.set_key('Enter', true);
	assert.ok(input.is_down('ENTER'), 'Enter');

	input.set_key('keyA', true);
	assert.ok(input.is_down('LEFT0'), 'keyA');
	input.set_key('a', false);
	assert.ok(!input.is_down('LEFT0'), 'a');

	input.set_key('keyD', true);
	assert.ok(input.is_down('RIGHT0'), 'keyD');
	input.set_key('d', false);
	assert.ok(!input.is_down('RIGHT0'), 'd');

	input.set_key('keyW', true);
	assert.ok(input.is_down('UP0'), 'keyW');
	input.set_key('w', false);
	assert.ok(!input.is_down('UP0'), 'w');

	input.set_key('keyS', true);
	assert.ok(input.is_down('DOWN0'), 'keyS');
	input.set_key('s', false);
	assert.ok(!input.is_down('DOWN0'), 's');

	input.set_key('ArrowLeft', true);
	assert.ok(input.is_down('LEFT1'), 'ArrowLeft');

	input.set_key('ArrowRight', true);
	assert.ok(input.is_down('RIGHT1'), 'ArrowRight');

	input.set_key('ArrowUp', true);
	assert.ok(input.is_down('UP1'), 'ArrowUp');

	input.set_key('ArrowDown', true);
	assert.ok(input.is_down('DOWN1'), 'ArrowDown');

	assert.ok(input.is_down_arr(['LEFT1', 'RIGHT1']), '11 array');
	assert.ok(input.is_down_arr(['RIGHT0', 'RIGHT1']), '01 array');
	assert.ok(input.is_down_arr(['LEFT1', 'LEFT0']), '10 array');
	assert.ok(!input.is_down_arr(['RIGHT0', 'LEFT0']), '00 array');
	assert.ok(!input.is_down_arr([]), 'empty array');

	input.reset('DOWN1');
	assert.ok(!input.is_down('DOWN1'), 'DOWN1 inactivated');
	assert.ok(input.is_down('UP1'), 'others still active');

	input.reset();
	assert.ok(!input.is_down_arr(['LEFT1', 'RIGHT1']), '11 array now inactive');
});
