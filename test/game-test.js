'use strict';

import {Game} from '../game.js';
import {options, levels} from '../options.js';


QUnit.test('Game starting', function(assert) {
	const game = new Game(options, levels);
	// game.start() will be automatically called by resources
	// During testing, game.loop() will not request itself, so it is no actual loop!

	assert.ok(typeof resources === 'object', 'Global variable resources exists');
	assert.ok(typeof input === 'object', 'Global variable input exists');
	assert.ok(game.stage !== null, 'There is a stage');
	assert.ok(game.screen !== null, 'There is a screen');
	assert.strictEqual(game.stage.name, 'start', 'Right stage loaded (start)');

	let result = game.update();
	assert.ok(result === null, 'update returns null (no new stage)');

	// eslint-disable-next-line
	input.set_key('Space', true);
	result = game.update();
	assert.ok(result !== null, 'result is not null');
	assert.strictEqual(result.next_stage, 'game', 'start game');
});
