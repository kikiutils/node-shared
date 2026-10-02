/**
 * Calls a generator once with a length sampled from two nested random ranges.
 *
 * @remarks
 * Integer bounds are inclusive. First, a lower bound is sampled between `minMin` and `minMax`;
 * the final length is sampled between the larger of that value and `maxMin`, and `maxMax`.
 * Inputs must be finite integers and `minMax` must not exceed `maxMax` for valid nested ranges;
 * these requirements are not checked beyond the two individual bound-order checks.
 * The callback is called synchronously once after sampling. Its return value, including a promise,
 * is returned unchanged, and any synchronous exception propagates.
 *
 * @typeParam T - The generator's return value, preserved without awaiting or copying.
 *
 * @param generator - The callback that receives the sampled length.
 * @param minMin - The inclusive lower bound for the first sample.
 * @param minMax - The inclusive upper bound for the first sample.
 * @param maxMin - The minimum inclusive lower bound for the final sample.
 * @param maxMax - The inclusive upper bound for the final sample.
 *
 * @returns The generator's result for the sampled length.
 *
 * @throws Error if `minMin` exceeds `minMax` or `maxMin` exceeds `maxMax`.
 */
export function generateWithNestedRandomLength<T = string>(
    generator: (length: number) => T,
    minMin: number,
    minMax: number,
    maxMin: number,
    maxMax: number,
) {
    if (minMin > minMax) throw new Error(`Invalid range: minMin (${minMin}) cannot be greater than minMax (${minMax})`);
    if (maxMin > maxMax) throw new Error(`Invalid range: maxMin (${maxMin}) cannot be greater than maxMax (${maxMax})`);

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const innerMin = random(minMin, minMax);
    const finalLength = random(Math.max(innerMin, maxMin), maxMax);
    return generator(finalLength);
}
