'use strict';

const all_strings = {
	EN: {
		left: 'left',
		right: 'right',
		fire: 'fire',
		one_player: 'One player',
		two_players: 'Two players',
		level: 'Level ',
		fire_to_continue: 'Fire to continue',
		you_reached_a: 'You reached level ',
		you_reached_b: '!',
		locale: 'en-GB'
	},
	DE: {
		left: 'links',
		right: 'rechts',
		fire: 'Feuer',
		one_player: 'Ein Spieler',
		two_players: 'Zwei Spieler',
		level: 'Level ',
		fire_to_continue: 'Zum Fortsetzen schießen',
		you_reached_a: 'Du hast es bis Level ',
		you_reached_b: ' geschafft!',
		locale: 'de-DE'
	},
	NO: {
		left: 'venstre',
		right: 'høyre',
		fire: 'skyt',
		one_player: 'Én spiller',
		two_players: 'To spillere',
		level: 'Level ',
		fire_to_continue: 'Skyt fo å fortsette',
		you_reached_a: 'Du klarte det til level ',
		you_reached_b: '!',
		locale: 'nb-NO'
	}
};


let lang = 'EN';
let Intstr = all_strings[lang];


function change_language(language) {
	lang = language || navigator.language || navigator.userLanguage;
	lang = lang.substring(0, 2).toUpperCase();

	if(!all_strings.hasOwnProperty(lang)) {
		lang = 'EN';
	}

	Intstr = all_strings[lang];
}

change_language();

export {Intstr, change_language};
