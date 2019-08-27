'use strict';

import Resources from '../resources.js';
import { Player } from '../entities.js';


// This allows the resources to "load" the graphics and just then start the
// tests. Otherwise, the tests would start automatically and a potential race
// condition might occur.
QUnit.config.autostart = false;

// "Load" the images. Start the tests when finished.
global.resources = new Resources();
resources.on_ready(() => {QUnit.start()});
resources.load([
	'gfx/sprites.png',
]);


QUnit.test( "initial Player properties", function(assert) {
	let player = new Player(100, 100);
	assert.ok(player.x === 70, "Player x position");
	assert.ok(player.sprite.frames.length === 1, "Player standard sprite");
});


QUnit.test( "Player properties after some time", function(assert) {
	let player = new Player(100, 100);
	let player2 = new Player(100, 100);

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

