'use strict';

const sprite_info = {
	// url, size, delay=1, offset={x: 0, y: 0}, frames=[{x: 0, y: 0}], zoom=1
	wall: {
		size: {w: 16, h: 16},
		offset: {x: 152, y: 36}
	},
	mystery: {
		size: {w: 64, h: 28},
		offset: {x: 0, y: 68}
	},
	enemy1: {
		size: {w: 32, h: 32},
		offset: {x: 0, y: 0},
		delay: 2,
		frames: [{x: 0, y: 0}, {x: 34, y: 0}]
	},
	enemy2: {
		size: {w: 44, h: 32},
		offset: {x: 68, y: 0},
		delay: 2,
		frames: [{x: 0, y: 0}, {x: 46, y: 0}]
	},
	enemy3: {
		size: {w: 48, h: 32},
		offset: {x: 160, y: 0},
		delay: 2,
		frames: [{x: 0, y: 0}, {x: 50, y: 0}]
	},
	bullet1: {
		size: {w: 12, h: 28},
		offset: {x: 0, y: 36},
		delay: 0.1,
		frames: [{x: 0, y: 0}, {x: 13, y: 0}, {x: 26, y: 0}, {x: 39, y: 0}]
	},
	bullet2: {
		size: {w: 12, h: 28},
		offset: {x: 52, y: 36},
		delay: 0.1,
		frames: [{x: 0, y: 0}, {x: 13, y: 0}, {x: 26, y: 0}]
	},
	bullet3: {
		size: {w: 12, h: 24},
		offset: {x: 92, y: 36},
		delay: 0.1,
		frames: [{x: 0, y: 0}, {x: 13, y: 0}, {x: 26, y: 0}, {x: 39, y: 0}]
	},
	bullet_explode: {
		size: {w: 12, h: 24},
		offset: {x: 172, y: 36}
	},
	player_bullet: {
		size: {w: 4, h: 16},
		offset: {x: 145, y: 36}
	},
	player_explode: {
		size: {w: 64, h: 32},
		offset: {x: 124, y: 68},
		delay: 0.5,
		frames: [{x: 0, y: 0}, {x: 64, y: 0}]
	},
	invul_single: {
		size: {w: 60, h: 32},
		offset: {x: 64, y: 104},
		delay: 0.2,
		frames: [{x: 0, y: 0}, {x: 62, y: 0}, {x: 124, y: 0}]
	},
	invul_double: {
		size: {w: 60, h: 32},
		offset: {x: 64, y: 140},
		delay: 0.2,
		frames: [{x: 0, y: 0}, {x: 62, y: 0}, {x: 124, y: 0}]
	},
	double: {
		size: {w: 60, h: 32},
		offset: {x: 0, y: 140}
	},
	empty: {
		size: {w: 1, h: 1},
		offset: {x: 0, y: 0}
	},
	enemy_explode: {
		size: {w: 52, h: 32},
		offset: {x: 68, y: 68}
	},
	arrow_left: {
		size: {w: 14, h: 22},
		offset: {x: 0, y: 176}
	},
	arrow_right: {
		size: {w: 14, h: 22},
		offset: {x: 16, y: 176}
	},
	life: {
		size: {w: 26, h: 22},
		offset: {x: 188, y: 36}
	},
	score: {
		size: {w: 16, h: 22},
		offset: {x: 216, y: 36}
	},
	player: {
		size: {w: 60, h: 32},
		offset: {x: 0, y: 100}
	},
	keys1: {
		url: 'keys.png',
		size: {w: 399, h: 116},
		offset: {x: 0, y: 0}
	},
	keys2: {
		url: 'keys.png',
		size: {w: 299, h: 116},
		offset: {x: 0, y: 118}
	},
	unfocused: {
		url: 'white.png',
		size: {w: 900, h: 100},
		offset: {x: 0, y: 0}
	},
	goodies: [
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 0}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 24}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 48}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 72}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 96}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 120}
		},
		{
			size: {w: 46, h: 22},
			offset: {x: 260, y: 144}
		}
	]
};

export {sprite_info};
