'use strict';

const options = {
	total_size: {w: 900, h: 600}, // Total size of the game
	border: 20,                   // Border that may not be touched by the enemies
	num_players: 1,               // Default number of players
	start_level: 0,               // Default start level
};

const levels = [
	{
		fort: [
			"__XXXX__",
			"XXXXXXXX",
			"XXXXXXXX",
			"XXXXXXXX",
			"XX____XX"
		],
		forts: 4,
		enemies: [
			"0000000000",
			"1111111111",
			"1111111111",
			"2222222222",
			"2222222222"
		]
	},
	{
		"fort": [
			"XX",
			"XX"
		],
		"forts": 10,
		"enemies": [
			"21111112",
			"21_00_12",
			"21_00_12",
			"21111112"
		]
	}
];

export {options, levels};
