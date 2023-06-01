import { random } from 'lodash';

const RANDOM_LETTERS = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM0123456789';
const RANDOM_LETTERS_LENGTH = RANDOM_LETTERS.length;

export const randomNum: typeof random = random;

export const randomStr = (minLength = 8, maxLength = 8): string => {
	let s = '';
	for (let i = 0; i < random(minLength, maxLength); i++) s += RANDOM_LETTERS.charAt(Math.floor(Math.random() * RANDOM_LETTERS_LENGTH));
	return s;
}
