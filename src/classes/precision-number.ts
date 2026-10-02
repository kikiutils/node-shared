import { Decimal } from 'decimal.js';

/**
 * Values accepted by `PrecisionNumber` constructors and arithmetic methods.
 */
export type PrecisionNumberValue = Decimal.Value | PrecisionNumber | { toString: () => string };

/**
 * A fixed-decimal number with mutable and immutable arithmetic operations.
 *
 * @remarks
 * `PrecisionNumber` stores values as `Decimal`, rounds every mutating operation to
 * the configured decimal places, and exposes both mutable and immutable arithmetic
 * methods. Mutable methods (`plus`, `minus`, `times`, `dividedBy`, `modulo`,
 * `pow`, `clamp`, `ceil`, `floor`, `negate`, `absoluteValue`) update the current
 * instance and return `this`; immutable methods prefixed with `to` return a new
 * `PrecisionNumber` with the same precision settings, leaving this instance unchanged.
 * Decimal.js exceptions propagate unchanged; non-finite arithmetic results are not converted into exceptions.
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
     */
    constructor(
        value: PrecisionNumberValue = '0',
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        this.#decimalPlaces = decimalPlaces;
        this.#rounding = rounding;
        this.#decimal = this.#decimalToFixedDecimal(new Decimal(value.toString().trim()));
    }

    // Private instance methods
    #decimalToFixedDecimal(decimal: Decimal) {
        return decimal.toDecimalPlaces(this.#decimalPlaces, this.#rounding);
    }

    #valueToString(value: PrecisionNumberValue) {
        return value.toString().trim();
    }

    // Public instance accessors

    /**
     * Decimal places retained by mutating operations and default formatting.
     */
    get decimalPlaces() {
        return this.#decimalPlaces;
    }

    /**
     * Decimal.js rounding mode used by mutating operations and default formatting.
     */
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
     * Formats a value with decimal.js without creating a reusable instance.
     *
     * @param value - Value to format.
     * @param decimalPlaces - Decimal places to output (default: `2`).
     * @param rounding - Decimal.js rounding mode (default: `Decimal.ROUND_DOWN`).
     *
     * @returns Fixed-decimal string.
     */
    static toFixed(
        value: PrecisionNumberValue,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        return new Decimal(value.toString().trim()).toFixed(decimalPlaces, rounding);
    }

    // Public instance methods

    /**
     * Returns the formatted value when inspected by Node.js utilities.
     */
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.value;
    }

    /**
     * Converts to a number for numeric coercion and to the fixed string otherwise.
     *
     * @param hint - JavaScript primitive-conversion hint.
     */
    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') return this.#decimal.toNumber();
        return this.value;
    }

    /**
     * Replaces the current value with its absolute value.
     *
     * @returns This instance for chaining.
     */
    absoluteValue() {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.absoluteValue());
        return this;
    }

    /**
     * Rounds the current value up to the nearest integer in place.
     *
     * @remarks
     * The stored value still uses this instance's configured decimal places for output.
     *
     * @returns This instance for chaining.
     */
    ceil() {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.ceil());
        return this;
    }

    /**
     * Restricts the current value to the inclusive range `[min, max]` in place.
     *
     * @param min - Lower bound.
     * @param max - Upper bound.
     *
     * @returns This instance for chaining.
     *
     * @throws Error if `min` is greater than `max`.
     */
    clamp(min: PrecisionNumberValue, max: PrecisionNumberValue) {
        const minDecimal = new Decimal(this.#valueToString(min));
        const maxDecimal = new Decimal(this.#valueToString(max));
        if (minDecimal.gt(maxDecimal)) throw new Error('Invalid clamp range: min cannot be greater than max');
        this.#decimal = this.#decimalToFixedDecimal(Decimal.min(Decimal.max(this.#decimal, minDecimal), maxDecimal));
        return this;
    }

    /**
     * Returns a new instance with the same value, decimal places, and rounding mode.
     */
    clone() {
        return new PrecisionNumber(this.#decimal, this.#decimalPlaces, this.#rounding);
    }

    /**
     * Divides the current value by another value in place.
     *
     * @param value - Divisor.
     *
     * @returns This instance for chaining.
     */
    dividedBy(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.dividedBy(this.#valueToString(value)));
        return this;
    }

    /**
     * Checks whether the current value equals another value.
     *
     * @param value - Value to compare.
     *
     * @returns Whether both numeric values are equal.
     */
    equals(value: PrecisionNumberValue) {
        return this.#decimal.equals(this.#valueToString(value));
    }

    /**
     * Rounds the current value down to the nearest integer in place.
     *
     * @remarks
     * The stored value still uses this instance's configured decimal places for output.
     *
     * @returns This instance for chaining.
     */
    floor() {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.floor());
        return this;
    }

    /**
     * Checks whether the current value is greater than another value.
     */
    gt(value: PrecisionNumberValue) {
        return this.#decimal.gt(this.#valueToString(value));
    }

    /**
     * Checks whether the current value is greater than or equal to another value.
     */
    gte(value: PrecisionNumberValue) {
        return this.#decimal.gte(this.#valueToString(value));
    }

    /**
     * Checks whether the current value is finite.
     */
    isFinite() {
        return this.#decimal.isFinite();
    }

    /**
     * Checks whether the current value is an integer.
     */
    isInteger() {
        return this.#decimal.isInteger();
    }

    /**
     * Checks whether the current value is `NaN`.
     */
    isNaN() {
        return this.#decimal.isNaN();
    }

    /**
     * Checks whether the current value is negative.
     */
    isNegative() {
        return this.#decimal.isNegative();
    }

    /**
     * Checks whether the current value is positive.
     */
    isPositive() {
        return this.#decimal.isPositive();
    }

    /**
     * Checks whether the current value is zero.
     */
    isZero() {
        return this.#decimal.isZero();
    }

    /**
     * Checks whether the current value is less than another value.
     */
    lt(value: PrecisionNumberValue) {
        return this.#decimal.lt(this.#valueToString(value));
    }

    /**
     * Checks whether the current value is less than or equal to another value.
     */
    lte(value: PrecisionNumberValue) {
        return this.#decimal.lte(this.#valueToString(value));
    }

    /**
     * Subtracts another value from the current value in place.
     */
    minus(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.minus(this.#valueToString(value)));
        return this;
    }

    /**
     * Replaces the current value with the remainder after division by another value.
     *
     * @param value - Divisor used to compute the remainder.
     *
     * @returns This instance for chaining.
     */
    modulo(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.modulo(this.#valueToString(value)));
        return this;
    }

    /**
     * Negates the current value in place.
     */
    negate() {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.negated());
        return this;
    }

    /**
     * Adds another value to the current value in place.
     */
    plus(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.plus(this.#valueToString(value)));
        return this;
    }

    /**
     * Raises the current value to an exponent in place.
     *
     * @param value - Exponent.
     *
     * @returns This instance for chaining.
     */
    pow(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.pow(this.#valueToString(value)));
        return this;
    }

    /**
     * Multiplies the current value by another value in place.
     */
    times(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.times(this.#valueToString(value)));
        return this;
    }

    /**
     * Returns a new instance with the absolute value.
     */
    toAbsoluteValue() {
        return new PrecisionNumber(this.#decimal.absoluteValue(), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Returns a new instance rounded up to the nearest integer.
     */
    toCeil() {
        return new PrecisionNumber(this.#decimal.ceil(), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Returns a new instance restricted to the inclusive range `[min, max]`.
     *
     * @param min - Lower bound.
     * @param max - Upper bound.
     *
     * @throws Error if `min` is greater than `max`.
     */
    toClamped(min: PrecisionNumberValue, max: PrecisionNumberValue) {
        return this.clone().clamp(min, max);
    }

    /**
     * Returns a new instance divided by another value.
     */
    toDividedBy(value: PrecisionNumberValue) {
        return new PrecisionNumber(
            this.#decimal.dividedBy(this.#valueToString(value)),
            this.#decimalPlaces,
            this.#rounding,
        );
    }

    /**
     * Returns a new instance rounded down to the nearest integer.
     */
    toFloor() {
        return new PrecisionNumber(this.#decimal.floor(), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Serializes to the fixed-decimal string.
     */
    toJSON() {
        return this.value;
    }

    /**
     * Returns a new instance with another value subtracted.
     */
    toMinus(value: PrecisionNumberValue) {
        return new PrecisionNumber(
            this.#decimal.minus(this.#valueToString(value)),
            this.#decimalPlaces,
            this.#rounding,
        );
    }

    /**
     * Returns a new instance with the remainder after division by another value.
     */
    toModulo(value: PrecisionNumberValue) {
        return new PrecisionNumber(
            this.#decimal.modulo(this.#valueToString(value)),
            this.#decimalPlaces,
            this.#rounding,
        );
    }

    /**
     * Returns a new instance with the value negated.
     */
    toNegated() {
        return new PrecisionNumber(this.#decimal.negated(), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Returns a new instance with another value added.
     */
    toPlus(value: PrecisionNumberValue) {
        return new PrecisionNumber(this.#decimal.plus(this.#valueToString(value)), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Returns a new instance raised to an exponent.
     */
    toPow(value: PrecisionNumberValue) {
        return new PrecisionNumber(this.#decimal.pow(this.#valueToString(value)), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Converts the current value to a JavaScript number.
     *
     * @remarks
     * Use `toString`/`value` when preserving decimal precision is more important than native-number ergonomics.
     */
    toNumber() {
        return this.#decimal.toNumber();
    }

    /**
     * Converts the current value to its fixed-decimal string.
     */
    toString() {
        return this.value;
    }

    /**
     * Formats the current value with custom precision and rounding for this call only.
     */
    toFixed(decimalPlaces: number = this.#decimalPlaces, rounding: Decimal.Rounding = this.#rounding) {
        return this.#decimal.toFixed(decimalPlaces, rounding);
    }

    /**
     * Returns a new instance multiplied by another value.
     */
    toTimes(value: PrecisionNumberValue) {
        return new PrecisionNumber(
            this.#decimal.times(this.#valueToString(value)),
            this.#decimalPlaces,
            this.#rounding,
        );
    }
}
