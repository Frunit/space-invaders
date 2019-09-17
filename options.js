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
		fort: [
			"XX",
			"XX"
		],
		forts: 10,
		enemies: [
			"21111112",
			"21_00_12",
			"21_00_12",
			"21111112"
		]
	},
	{
		fort: [
			"XX__________XX",
			"_XXXX____XXXX_",
			"___XXXXXXXX___",
			"_____XXXX_____"
		],
		forts: 2,
		enemies: [
			"00000______00000",
			"__11111__11111__",
			"___2222222222___",
			"______1001______"
		]
	},
	{
		fort: [
			"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
		],
		forts: 1,
		enemies: [
			"___00___",
			"__0000__",
			"_000000_",
			"00_00_00",
			"00000000",
			"_0_00_0_",
			"0______0",
			"_0____0_"
		]
	}
];


export {options, levels};
