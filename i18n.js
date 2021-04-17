'use strict';

const all_strings = {
	EN: {
		lang: 'EN',
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
		lang: 'DE',
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
		lang: 'NO',
		left: 'venstre',
		right: 'høyre',
		fire: 'skyt',
		one_player: 'Én spiller',
		two_players: 'To spillere',
		level: 'Level ',
		fire_to_continue: 'Skyt for å fortsette',
		you_reached_a: 'Du klarte det til level ',
		you_reached_b: '!',
		locale: 'nb-NO'
	}
};


let current = 'EN';
const langs = Object.getOwnPropertyNames(all_strings).sort();
let lang_idx = langs.indexOf(current);
let lang = all_strings[current];


/**
 * <tt>lang_change</tt> allows to change the language. If no argument is given,
 * it tries to determine the language from Browser settings. With an argument,
 * it goes through the list of supported languages, depending on the sign of the
 * argument.
 *
 * @param {number} [dir=null] - Direction in which to go through the list
 */
function lang_change(dir) {
	if(dir > 0) {
		lang_idx++;
		if(lang_idx >= langs.length) {
			lang_idx = 0;
		}

		current = langs[lang_idx];
	}
	else if(dir < 0) {
		lang_idx--;
		if(lang_idx < 0) {
			lang_idx = langs.length - 1;
		}

		current = langs[lang_idx];
	}
	else {
		if(typeof navigator === 'undefined') {
			current = 'EN';
		}
		else {
			current = navigator.language || navigator.userLanguage;
			current = current.substring(0, 2).toUpperCase();

			if(! (current in all_strings)) {
				current = 'EN';
			}
		}
	}

	lang = all_strings[current];
}

lang_change();

export {lang, lang_change};
