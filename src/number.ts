import { millify } from 'millify';

export const prettyNumberToString = (value: number) => millify(value, { lowercase: true, precision: 2 });
export const toPercentString = (molecular: number, denominator: number, withSymbol: boolean = true) => {
	const calculationResult = molecular / denominator;
	const result = isNaN(calculationResult) ? '0' : (calculationResult * 100).toFixed(2).replace(/\.?0+$/, '');
	return withSymbol ? `${result}%` : result;
};
