import { Decimal } from 'decimal.js';

// Private constructors isolate arithmetic from `Decimal.set` calls elsewhere. Sums, differences, products, and
// remainders have bounded digits, so they run at the maximum precision and stay exact; only division and powers,
// whose exact results can be unbounded, round at 100 significant digits before the final `decimalPlaces` rounding.
const ExactDecimal = Decimal.clone({
    defaults: true,
    precision: 1e9,
});

const BoundedDecimal = Decimal.clone({
    defaults: true,
    precision: 100,
});

// Plain decimal notation only: decimal.js would also accept hex, binary, octal, exponent notation, `NaN`, and
// `Infinity`, and an unbounded exponent lets `toFixed` build an arbitrarily long string.
const decimalStringPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

/**
 * Values accepted by `PrecisionNumber` constructors and arithmetic methods.
 *
 * @remarks
 * Strings must use plain decimal notation, optionally signed and surrounded by whitespace; numbers and `Decimal`
 * instances must be finite. Bigints are always accepted.
 */
export type PrecisionNumberValue = Decimal.Value | PrecisionNumber;

/**
 * A fixed-decimal number with mutable and immutable arithmetic operations.
 *
 * @remarks
 * Every operation rounds its result to the configured decimal places. Arithmetic methods update this instance and
 * return `this`; their `to`-prefixed counterparts return a new instance with the same configuration instead.
 * Addition, subtraction, multiplication, and remainders are exact before that rounding; division and powers keep
 * 100 significant digits. Results ignore the global `Decimal` configuration, and negative zero is stored as zero.
 * Invalid inputs throw `TypeError`, and operations whose result is not finite, such as division by zero, throw
 * `RangeError` without changing the value.
 *
 * @example
 *
 * ```ts
 * import { PrecisionNumber } from '@kikiutils/shared/classes/precision-number';
 *
 * const value = new PrecisionNumber('1.239', 2).plus('2.111');
 * value.toString(); // => '3.35'
 * value.toMinus('1').toString(); // => '2.35' (original value remains '3.35')
 * ```
 */
export class PrecisionNumber {
    // Private instance properties
    readonly #decimalPlaces: number;
    readonly #rounding: Decimal.Rounding;
    #decimal: Decimal;

    // Constructor

    /**
     * Creates a fixed-decimal number.
     *
     * @param value - Initial value (default: `'0'`).
     * @param decimalPlaces - Decimal places retained after operations (default: `2`).
     * @param rounding - Decimal.js rounding mode (default: `Decimal.ROUND_DOWN`).
     *
     * @throws TypeError if the value is not a finite plain decimal.
     */
    constructor(
        value: PrecisionNumberValue = '0',
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        this.#decimalPlaces = decimalPlaces;
        this.#rounding = rounding;
        this.#decimal = this.#round(PrecisionNumber.#toDecimal(value));
    }

    // Private static methods
    static #parse(value: unknown): Decimal | undefined {
        if (value instanceof PrecisionNumber) return value.#decimal;
        if (typeof value === 'string') {
            const text = value.trim();
            return decimalStringPattern.test(text) ? new ExactDecimal(text) : undefined;
        }

        if (typeof value === 'bigint') return new ExactDecimal(value);
        if (typeof value === 'number') return Number.isFinite(value) ? new ExactDecimal(value) : undefined;
        if (!Decimal.isDecimal(value)) return;
        try {
            const decimal = new ExactDecimal(value);
            return decimal.isFinite() ? decimal : undefined;
        } catch {
            // Objects that only imitate the Decimal brand cannot be converted.
        }
    }

    static #toDecimal(value: PrecisionNumberValue) {
        const decimal = PrecisionNumber.#parse(value);
        if (!decimal) throw new TypeError('Invalid decimal value: expected a finite plain decimal');
        return decimal;
    }

    // Private instance methods
    #round(decimal: Decimal) {
        const rounded = new ExactDecimal(decimal.toDecimalPlaces(this.#decimalPlaces, this.#rounding));
        if (!rounded.isFinite()) throw new RangeError('Result is not finite');
        return rounded.isZero() ? new ExactDecimal(0) : rounded;
    }

    #set(decimal: Decimal) {
        this.#decimal = this.#round(decimal);
        return this;
    }

    // Public instance accessors
    get decimalPlaces() {
        return this.#decimalPlaces;
    }

    get rounding() {
        return this.#rounding;
    }

    /**
     * Fixed-decimal string using the instance precision and rounding mode.
     */
    get value() {
        return this.#decimal.toFixed(this.#decimalPlaces, this.#rounding);
    }

    // Public static methods

    /**
     * Formats a value as an instance with the given configuration would.
     *
     * @param value - Value to format.
     * @param decimalPlaces - Decimal places to output (default: `2`).
     * @param rounding - Decimal.js rounding mode (default: `Decimal.ROUND_DOWN`).
     *
     * @throws TypeError if the value is not a finite plain decimal.
     */
    static toFixed(
        value: PrecisionNumberValue,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        return new PrecisionNumber(value, decimalPlaces, rounding).value;
    }

    /**
     * Creates an instance, or returns `undefined` when the value is not a finite plain decimal.
     *
     * @remarks
     * Use this to validate untrusted input. Invalid `decimalPlaces` or `rounding` arguments throw regardless of the
     * value.
     *
     * @example
     *
     * ```ts
     * const isPositiveAmount = (input: string) => PrecisionNumber.tryFrom(input)?.gt(0) ?? false;
     * ```
     */
    static tryFrom(
        value: unknown,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        const instance = new PrecisionNumber('0', decimalPlaces, rounding);
        const decimal = PrecisionNumber.#parse(value);
        return decimal ? instance.#set(decimal) : undefined;
    }

    // Public instance methods

    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.value;
    }

    /**
     * Converts to a number for numeric coercion and to the fixed string otherwise.
     */
    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') return this.#decimal.toNumber();
        return this.value;
    }

    absoluteValue() {
        return this.#set(this.#decimal.absoluteValue());
    }

    ceil() {
        return this.#set(this.#decimal.ceil());
    }

    /**
     * Restricts the current value to the inclusive range `[min, max]` in place.
     *
     * @remarks
     * The bounds apply before rounding, so a bound with more decimal places than this instance can round outside
     * the range.
     *
     * @throws RangeError if `min` is greater than `max`.
     */
    clamp(min: PrecisionNumberValue, max: PrecisionNumberValue) {
        const minDecimal = PrecisionNumber.#toDecimal(min);
        const maxDecimal = PrecisionNumber.#toDecimal(max);
        if (minDecimal.gt(maxDecimal)) throw new RangeError('Invalid clamp range: min cannot be greater than max');
        return this.#set(ExactDecimal.min(ExactDecimal.max(this.#decimal, minDecimal), maxDecimal));
    }

    clone() {
        return new PrecisionNumber(this.#decimal, this.#decimalPlaces, this.#rounding);
    }

    dividedBy(value: PrecisionNumberValue) {
        return this.#set(new BoundedDecimal(this.#decimal).dividedBy(PrecisionNumber.#toDecimal(value)));
    }

    equals(value: PrecisionNumberValue) {
        return this.#decimal.equals(PrecisionNumber.#toDecimal(value));
    }

    floor() {
        return this.#set(this.#decimal.floor());
    }

    gt(value: PrecisionNumberValue) {
        return this.#decimal.gt(PrecisionNumber.#toDecimal(value));
    }

    gte(value: PrecisionNumberValue) {
        return this.#decimal.gte(PrecisionNumber.#toDecimal(value));
    }

    isInteger() {
        return this.#decimal.isInteger();
    }

    /**
     * Checks whether the current value is less than zero.
     */
    isNegative() {
        return this.#decimal.lt(0);
    }

    /**
     * Checks whether the current value is greater than zero.
     */
    isPositive() {
        return this.#decimal.gt(0);
    }

    isZero() {
        return this.#decimal.isZero();
    }

    lt(value: PrecisionNumberValue) {
        return this.#decimal.lt(PrecisionNumber.#toDecimal(value));
    }

    lte(value: PrecisionNumberValue) {
        return this.#decimal.lte(PrecisionNumber.#toDecimal(value));
    }

    minus(value: PrecisionNumberValue) {
        return this.#set(this.#decimal.minus(PrecisionNumber.#toDecimal(value)));
    }

    modulo(value: PrecisionNumberValue) {
        return this.#set(this.#decimal.modulo(PrecisionNumber.#toDecimal(value)));
    }

    negate() {
        return this.#set(this.#decimal.negated());
    }

    plus(value: PrecisionNumberValue) {
        return this.#set(this.#decimal.plus(PrecisionNumber.#toDecimal(value)));
    }

    pow(value: PrecisionNumberValue) {
        return this.#set(new BoundedDecimal(this.#decimal).pow(PrecisionNumber.#toDecimal(value)));
    }

    times(value: PrecisionNumberValue) {
        return this.#set(this.#decimal.times(PrecisionNumber.#toDecimal(value)));
    }

    toAbsoluteValue() {
        return this.clone().absoluteValue();
    }

    toCeil() {
        return this.clone().ceil();
    }

    /**
     * Returns a new instance restricted to the inclusive range `[min, max]`.
     *
     * @throws RangeError if `min` is greater than `max`.
     */
    toClamped(min: PrecisionNumberValue, max: PrecisionNumberValue) {
        return this.clone().clamp(min, max);
    }

    toDividedBy(value: PrecisionNumberValue) {
        return this.clone().dividedBy(value);
    }

    /**
     * Formats the current value with custom precision and rounding for this call only.
     */
    toFixed(decimalPlaces: number = this.#decimalPlaces, rounding: Decimal.Rounding = this.#rounding) {
        const decimal = this.#decimal.toDecimalPlaces(decimalPlaces, rounding);
        return (decimal.isZero() ? decimal.absoluteValue() : decimal).toFixed(decimalPlaces);
    }

    toFloor() {
        return this.clone().floor();
    }

    toJSON() {
        return this.value;
    }

    toMinus(value: PrecisionNumberValue) {
        return this.clone().minus(value);
    }

    toModulo(value: PrecisionNumberValue) {
        return this.clone().modulo(value);
    }

    toNegated() {
        return this.clone().negate();
    }

    /**
     * Converts to a JavaScript number, which can lose precision; use `value` for exact output.
     */
    toNumber() {
        return this.#decimal.toNumber();
    }

    toPlus(value: PrecisionNumberValue) {
        return this.clone().plus(value);
    }

    toPow(value: PrecisionNumberValue) {
        return this.clone().pow(value);
    }

    toString() {
        return this.value;
    }

    toTimes(value: PrecisionNumberValue) {
        return this.clone().times(value);
    }
}
