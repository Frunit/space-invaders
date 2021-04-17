'use strict';

import {lang} from '../i18n.js';
import {Highscore} from '../highscore.js';
import {Text} from '../text.js';
import {GUI_Element} from '../guielement.js';
import {Resources} from '../resources.js';

// 'Load' the images.
global.resources = new Resources();
resources.load([
	'gfx/sprites.png'
]);


const date = new Date('2019-05-04T13:37:59');
const formatted_date = date.toLocaleString(lang.locale, {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});


QUnit.test('Highscore setup', function(assert) {
	localStorage.store = {}; // Reset local storage since tests must be independent
	assert.strictEqual(localStorage.getItem('highscore'), null, 'localStorage is resetted');

	const hs = new Highscore({w: 900, h: 600}, [20, 40], 3, date);
	assert.strictEqual(hs.name, 'highscore', 'highscore name');
	hs.setup();

	// Date.toLocaleString is implementation dependent, so I cannot assume that
	// it will be formatted exactly as I want it to be. I can just compare
	// whether it uses the same parameters as I expect...
	assert.strictEqual(typeof hs.date, 'string', 'date type');
	assert.strictEqual(hs.date, formatted_date, 'date formatting');

	assert.ok(!hs.finished, 'finished');
	assert.strictEqual(hs.level, 4, 'level');
	assert.strictEqual(hs.highscore.length, 6, 'highscore length');
	assert.deepEqual(hs.highscore[0], {'date': formatted_date, 'score': 40}, 'first element');
	assert.deepEqual(hs.highscore[1], {'date': formatted_date, 'score': 20}, 'second element');
	assert.deepEqual(hs.highscore[2], {'date': '-', 'score': 0}, 'thrid element');

	assert.deepEqual(JSON.parse(localStorage.getItem('highscore'))[1], {'date': formatted_date, 'score': 20}, 'saved in localStorage');

	assert.strictEqual(hs.texts.dates.length, 6, 'table dates length');
	assert.deepEqual(hs.texts.dates[0], new Text(formatted_date, 225, 150), 'table dates element 1');
	assert.deepEqual(hs.texts.dates[5], new Text('-', 225, 300), 'table dates element 6');
	assert.strictEqual(hs.texts.scores.length, 6, 'table scores length');
	assert.deepEqual(hs.texts.scores[0], new Text('000040', 675, 150, 'right'), 'table scores element 1');
	assert.deepEqual(hs.texts.scores[5], new Text('000000', 675, 300, 'right'), 'table scores element 6');

	assert.strictEqual(hs.texts.level.length, 1, 'table level length');
	assert.deepEqual(hs.texts.level[0], new Text('You reached level 4!', 450, 50, 'center'), 'table level element');

	assert.strictEqual(hs.texts.footer.length, 1, 'table footer length');
	assert.deepEqual(hs.texts.footer[0], new Text('Fire to continue', 450, 550, 'center'), 'table footer element');

	assert.strictEqual(hs.enemies.length, 2, 'enemies length');
	assert.deepEqual(hs.enemies[0], new GUI_Element(50, 150, 'enemy1'), 'enemy 1');
	assert.deepEqual(hs.enemies[1], new GUI_Element(722, 150, 'enemy1'), 'enemy 2');
});


QUnit.test('Highscore update', function(assert) {
	localStorage.store = {}; // Reset local storage since tests must be independent
	assert.strictEqual(localStorage.getItem('highscore'), null, 'localStorage is resetted');

	const hs = new Highscore({w: 900, h: 600}, [1230954718, 0], 123, date);
	hs.setup();

	const enemy1 = new GUI_Element(50, 150, 'enemy1');
	const enemy2 = new GUI_Element(722, 150, 'enemy1');

	assert.strictEqual(hs.enemies.length, 2, 'enemies length');
	assert.deepEqual(hs.enemies[0], enemy1, 'enemy 1');
	assert.deepEqual(hs.enemies[1], enemy2, 'enemy 2');

	let ret;

	for(let i = 0; i < 5; i++) {
		ret = hs.update(1);
		enemy1.sprite.update(1);
		enemy2.sprite.update(1);

		assert.strictEqual(ret, null, 'return is null');
		assert.strictEqual(hs.enemies.length, 2, 'enemies length');
		assert.deepEqual(hs.enemies[0], enemy1, 'enemy 1');
		assert.deepEqual(hs.enemies[1], enemy2, 'enemy 2');
	}
});


QUnit.test('Highscore add score', function(assert) {
	localStorage.store = {}; // Reset local storage since tests must be independent
	assert.strictEqual(localStorage.getItem('highscore'), null, 'localStorage is resetted');

	let my_highscore = [
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
	];

	let hs = new Highscore({w: 900, h: 600}, [], 0, date);
	hs.setup();

	assert.deepEqual(hs.highscore, my_highscore, 'initial highscore');

	hs.date = '10.1';
	hs.add_score(10);
	my_highscore[0] = {'date': '10.1', 'score': 10};
	assert.deepEqual(hs.highscore, my_highscore, 'one entry added');

	hs.date = '10.2';
	hs.add_score(10);
	my_highscore[1] = {'date': '10.2', 'score': 10};
	assert.deepEqual(hs.highscore, my_highscore, 'equal entry added');

	hs.save_highscore(); // Save to localStorage

	hs.date = '30.1';
	hs.add_score(30);
	hs.date = '5.1';
	hs.add_score(5);
	hs.date = 'large';
	hs.add_score(987654321);
	my_highscore = [
		{'date': 'large', 'score': 987654321},
		{'date': '30.1', 'score': 30},
		{'date': '10.1', 'score': 10},
		{'date': '10.2', 'score': 10},
		{'date': '5.1', 'score': 5},
		{'date': '-', 'score': 0},
	];
	assert.deepEqual(hs.highscore, my_highscore, 'more entries added');

	hs.date = '30.2';
	hs.add_score(30);
	hs.date = '7.1';
	hs.add_score(7);
	my_highscore = [
		{'date': 'large', 'score': 987654321},
		{'date': '30.1', 'score': 30},
		{'date': '30.2', 'score': 30},
		{'date': '10.1', 'score': 10},
		{'date': '10.2', 'score': 10},
		{'date': '7.1', 'score': 7},
	];
	assert.deepEqual(hs.highscore, my_highscore, 'even more entries added');

	// Create a new highscore. Should load from localStorage
	hs = new Highscore({w: 900, h: 600}, [], 0, date);
	hs.setup();

	my_highscore = [
		{'date': '10.1', 'score': 10},
		{'date': '10.2', 'score': 10},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
	];
	assert.deepEqual(hs.highscore, my_highscore, 'new from localStorage');

	hs.date = 'float';
	hs.add_score(15.34);
	hs.date = 'negative';
	hs.add_score(-1);
	my_highscore = [
		{'date': 'float', 'score': 15.34},
		{'date': '10.1', 'score': 10},
		{'date': '10.2', 'score': 10},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
		{'date': '-', 'score': 0},
	];
	assert.deepEqual(hs.highscore, my_highscore, 'even more entries added');
});
