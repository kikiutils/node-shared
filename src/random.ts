/**
 * Generates a value using a provided generator function, where the input length
 * is determined by two levels of nested random ranges:
 *
 * 1. First, a random number (`innerMin`) is chosen between `minMin` and `minMax`.
 * 2. Then, a final length is chosen between `Math.max(innerMin, maxMin)` and `maxMax`.
 * 3. The generator is called with the final length and its result is returned.
 *
 * This function supports any return type by using a generic type parameter.
 *
 * @template T - The return type of the generator function
 *
 * @param {(length: number) => T} generator - A function that accepts a length and returns a value of type T
 * @param {number} minMin - Lower bound of the first random range
 * @param {number} minMax - Upper bound of the first random range
 * @param {number} maxMin - Lower bound of the second random range
 * @param {number} maxMax - Upper bound of the second random range
 *
 * @returns {T} The result of the generator function using the computed final length
 */
export function generateWithNestedRandomLength<T = string>(
    generator: (length: number) => T,
    minMin: number,
    minMax: number,
    maxMin: number,
    maxMax: number,
) {
    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const innerMin = random(minMin, minMax);
    const finalLength = random(Math.max(innerMin, maxMin), maxMax);
    return generator(finalLength);
}
