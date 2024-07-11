import { millify } from 'millify';

export const prettyNumberToString = (value: number, options?: Parameters<typeof millify>[1]) => millify(value, { lowercase: true, precision: 2, ...options });
