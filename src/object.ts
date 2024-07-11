/**
 * Sorts the keys of an object in ascending order.
 *
 * @template T - The type of the object to be sorted.
 * @param {T} object - The object whose keys need to be sorted.
 * @returns {T} A new object with keys sorted in ascending order.
 *
 * @example
 * ```typescript
 * import { ksort } from '@kikiutils/node/object';
 *
 * const unsortedObject = { b: 2, a: 1, c: 3 };
 * const sortedObject = ksort(unsortedObject);
 * console.log(sortedObject); // Output: { a: 1, b: 2, c: 3 }
 * ```
 */
export const ksort = <T extends Record<string, any>>(object: T): T => {
	const keys = Object.keys(object).sort();
	const sortedObj: Record<string, any> = {};
	for (const key of keys) sortedObj[key] = object[key];
	return sortedObj as T;
};
