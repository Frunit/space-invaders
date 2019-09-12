'use strict';

import Resources from '../resources.js';
import {Sprite} from '../sprite.js';


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


QUnit.test('Sprite default values', function(assert) {
	let sprite = new Sprite('sprites.png', {w: 64, h: 64});

	assert.strictEqual(sprite.pic, 'gfx/sprites.png', 'url existing');
	assert.deepEqual(sprite.offset, {x: 0, y: 0}, 'default value offset');
	assert.deepEqual(sprite.frames, [{x: 0, y: 0}], 'default value frames');
	assert.strictEqual(sprite.delay, 1, 'default value delay');
	assert.ok(sprite.is_new_frame(), 'default value fresh');
	assert.strictEqual(sprite.idx, 0, 'default value idx');

	assert.throws(() => {new Sprite('asdf', {w: 64, h: 64});}, 'Should throw upon unknown url');
});


QUnit.test('Sprite updates', function(assert) {
	let sprite = new Sprite('sprites.png', {w: 5, h: 5}, 0.5, {x: 10, y: 400}, [{x: 0, y: 0}, {x: 5, y: 0}, {x: 10, y: 0}, {x: 0, y: 5}, {x: 5, y: 5}]);

	assert.strictEqual(sprite.idx, 0, 'default value idx');
	assert.ok(sprite.is_new_frame(), 'default value fresh');
	assert.ok(!sprite.is_new_frame(), 'repeated asking for is_new_frame');
	let renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 0, 'initial render x');
	assert.strictEqual(renderinfo.y, 400 + 0, 'initial render y');

	sprite.update(0.1);
	assert.strictEqual(sprite.idx, 0, 'idx after 0.1 s');
	assert.ok(!sprite.is_new_frame(), 'fresh after 0.1 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 0, 'render x after 0.1 s');
	assert.strictEqual(renderinfo.y, 400 + 0, 'render y after 0.1 s');

	sprite.update(0.41);
	assert.strictEqual(sprite.idx, 1, 'idx after 0.51 s');
	assert.ok(sprite.is_new_frame(), 'fresh after 0.51 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 5, 'render x after 0.51 s');
	assert.strictEqual(renderinfo.y, 400 + 0, 'render y after 0.51 s');

	sprite.update(1);
	assert.strictEqual(sprite.idx, 3, 'idx after 1.51 s');
	assert.ok(sprite.is_new_frame(), 'fresh after 1.51 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 0, 'render x after 1.51 s');
	assert.strictEqual(renderinfo.y, 400 + 5, 'render y after 1.51 s');

	sprite.update(2.384);
	assert.strictEqual(sprite.idx, 7, 'idx after 3.894 s');
	assert.ok(sprite.is_new_frame(), 'fresh after 3.894 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 10, 'render x after 3.894 s');
	assert.strictEqual(renderinfo.y, 400 + 0, 'render y after 3.894 s');

	sprite.update(0.101);
	assert.strictEqual(sprite.idx, 7, 'idx after 3.995 s');
	assert.ok(!sprite.is_new_frame(), 'fresh after 3.995 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 10, 'render x after 3.995 s');
	assert.strictEqual(renderinfo.y, 400 + 0, 'render y after 3.995 s');

	sprite.update(0.01);
	assert.strictEqual(sprite.idx, 8, 'idx after 4.005 s');
	assert.ok(sprite.is_new_frame(), 'fresh after 4.005 s');
	renderinfo = sprite.render();
	assert.strictEqual(renderinfo.x, 10 + 0, 'render x after 4.005 s');
	assert.strictEqual(renderinfo.y, 400 + 5, 'render y after 4.005 s');

	sprite.reset();
	let sprite2 = new Sprite('sprites.png', {w: 5, h: 5}, 0.5, {x: 10, y: 400}, [{x: 0, y: 0}, {x: 5, y: 0}, {x: 10, y: 0}, {x: 0, y: 5}, {x: 5, y: 5}]);
	assert.deepEqual(sprite, sprite2, 'reset');
	assert.ok(sprite.is_new_frame(), 'fresh after reset');
});


QUnit.test('Sprite without delay', function(assert) {
	let sprite = new Sprite('sprites.png', {w: 5, h: 5}, 0, {x: 10, y: 400}, [{x: 0, y: 0}, {x: 5, y: 0}, {x: 10, y: 0}, {x: 0, y: 5}, {x: 5, y: 5}]);

	assert.strictEqual(sprite.idx, 0, 'default value idx');
	assert.ok(sprite.is_new_frame(), 'default value fresh');
	assert.ok(!sprite.is_new_frame(), 'repeated asking for is_new_frame');

	sprite.update(0.8649);
	assert.strictEqual(sprite.idx, 0, 'idx after 0.8649 s');
	assert.strictEqual(sprite.delay_counter, 0, 'delay_counter after 0.8649 s');
	assert.ok(!sprite.is_new_frame(), 'fresh after 0.8649 s');

	sprite.update(7.0);
	assert.strictEqual(sprite.idx, 0, 'idx after 7.8649 s');
	assert.strictEqual(sprite.delay_counter, 0, 'delay_counter after 7.8649 s');
	assert.ok(!sprite.is_new_frame(), 'fresh after 7.8649 s');
});
