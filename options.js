'use strict';

const options = {
	total_size: {w: 900, h: 600}, // Total size of the game
	border: 20,                   // Border that may not be touched by the enemies
	num_players: 1,               // Default number of players
	start_level: 0,               // Default start level
	start_lives: 3,               // Default start lives
	show_fps: false,              // Show current frames per second
	drop_chance: 0.333,           // Goody drop chance
	enemy_level_speedup: 0.333,   // Speedup of enemies when the levels loop
	enemy_line_speedup: 0.05,     // Speedup of enemies each new line
	enemy_dx: 60,                 // Distance between two enemies on the x axis
	enemy_dy: 50,                 // Distance between two enemies on the y axis
	enemy_downwards_speed: 0.2,   // Downwards speed of enemies, when the reach a border
	enemy_speed: 64,              // Enemy speed in pixels per second
	enemy_fire_prob: 0.001,       // Probability of an enemy firing (per frame)
	enemy_cooldown: 2,            // Enemy cooldown between two shots in seconds
	explosion_time: 2,            // How long an explosion is shown in seconds
	mystery_prob: 0.001,          // Probability of a mystery appearing (per frame)
	mystery_speed: 96,            // Mystery speed in pixels per second
	bullet_speed: 300,            // Bullet speed in pixels per second
	player_speed: 128,            // Player speed in pixels per second
	player_cooldown: 1,           // Player cooldown between two shots in seconds
	player_rapid_cooldown: 0.3,   // Player cooldown between two shots when in rapid mode
	player_kill_time: 2,          // How long the player is disabled after killed in seconds
	goodie_time: 7,               // Time a goody is active in seconds
	goodie_speed: 64,             // Goody speed in pixels per second
	scores: {                     // Scores for various events
		enemy1: 30,
		enemy2: 20,
		enemy3: 10,
		mystery: 500,
		goldgoody: 300,
	},
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
			"000______000",
			"11111__11111",
			"_2222222222_",
			"____1001____"
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
	},
	{
		fort: [
			"X_X_X_X_X_X_X_X_X",
			"_X_X_X_X_X_X_X_X_",
			"X_X_X_X_X_X_X_X_X"
		],
		forts: 2,
		enemies: [
			"00121212100",
			"01212_21210",
			"1212___2121",
			"212__0__212",
			"12_______21",
			"2_________2"
		]
	},
	{
		fort: [
			"_XXXX_",
			"XXXXXX",
			"_XXXX_"
		],
		forts: 5,
		enemies: [
			"10000101",
			"10111101",
			"10110001",
			"10111101",
			"_100001_"
		]
	},
	{
		fort: [
			"XXXXX",
			"XXXXX",
			"XXXXX",
			"XXXXX",
			"XXXXX",
			"XXXXX"
		],
		forts: 10,
		enemies: [
			"01211210",
			"12111121",
			"22222222",
			"12111121",
			"01211210",
		]
	}
];


export {options, levels};
