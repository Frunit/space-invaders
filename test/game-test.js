'use strict';

import {Game} from '../game.js';
import {options, levels} from '../options.js';

// TODO: Test if options exist.
// TODO: Test sending "Enter" (or other keys) to input and check the response. This also triggers a stage change from start to game!
// TODO: Test for the presence of screen
// TODO: Test multiple stage changes


QUnit.test('Game starting', function(assert) {
	const game = new Game(options, levels);

	assert.ok(typeof resources !== 'undefined', 'Global variable resources exists');

	game.start();
	// During testing, game.loop() will not request itself, so it is no actual loop!

	let result = game.update();
	assert.ok(result === null, 'update returns null');
});
