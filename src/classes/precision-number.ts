import { Decimal } from 'decimal.js';

/**
 * Values accepted by `PrecisionNumber` constructors and arithmetic methods.
 */
export type PrecisionNumberValue = Decimal.Value | PrecisionNumber | { toString: () => string };

/**
 * Chainable fixed-decimal wrapper around `decimal.js`.
 *
 * `PrecisionNumber` stores values as `Decimal`, rounds every mutating operation to
 * the configured decimal places, and exposes both mutable and immutable arithmetic
 * methods. Mutable methods (`plus`, `minus`, `times`, `dividedBy`, `negate`,
 * `absoluteValue`) update the current instance and return `this`; immutable methods
 * prefixed with `to` return a new `PrecisionNumber` with the same precision settings.
 *
 * @example
 * ```typescript
 * import { PrecisionNumber } from '@kikiutils/shared/classes/precision-number';
 *
 * const value = new PrecisionNumber('1.239', 2).plus('2.111');
 * value.toString(); // '3.35'
 * value.toMinus('1').toString(); // '2.35' (original value remains '3.35')
 * ```
 */
export class PrecisionNumber {
    // Private properties
    readonly #decimalPlaces: number;
    readonly #rounding: Decimal.Rounding;
    #decimal: Decimal;

    /**
     * Creates a fixed-decimal number.
     *
     * @param {PrecisionNumberValue} [value] - Initial value (default: `'0'`)
     * @param {number} [decimalPlaces] - Decimal places retained after operations (default: `2`)
     * @param {Decimal.Rounding} [rounding] - Decimal.js rounding mode (default: `Decimal.ROUND_DOWN`)
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

    // Symbols

    /**
     * Returns the formatted value when inspected by Node.js utilities.
     */
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.value;
    }

    /**
     * Converts to a number for numeric coercion and to the fixed string otherwise.
     *
     * @param {string} hint - JavaScript primitive-conversion hint
     */
    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') return this.#decimal.toNumber();
        return this.value;
    }

    // Private methods
    #decimalToFixedDecimal(decimal: Decimal) {
        return decimal.toDecimalPlaces(this.#decimalPlaces, this.#rounding);
    }

    // Public getters

    /**
     * Fixed-decimal string using the instance precision and rounding mode.
     */
    get value() {
        return this.#decimal.toFixed(this.#decimalPlaces, this.#rounding);
    }

    /**
     * Formats a value with decimal.js without creating a reusable instance.
     *
     * @param {PrecisionNumberValue} value - Value to format
     * @param {number} [decimalPlaces] - Decimal places to output (default: `2`)
     * @param {Decimal.Rounding} [rounding] - Decimal.js rounding mode (default: `Decimal.ROUND_DOWN`)
     *
     * @returns {string} Fixed-decimal string
     */
    static toFixed(
        value: PrecisionNumberValue,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        return new Decimal(value.toString().trim()).toFixed(decimalPlaces, rounding);
    }

    // Public methods

    /**
     * Replaces the current value with its absolute value.
     *
     * @returns {this} The current instance for chaining
     */
    absoluteValue() {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.absoluteValue());
        return this;
    }

    /**
     * Divides the current value by another value in place.
     *
     * @param {PrecisionNumberValue} value - Divisor
     *
     * @returns {this} The current instance for chaining
     */
    dividedBy(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.dividedBy(value.toString().trim()));
        return this;
    }

    /**
     * Checks whether the current value equals another value.
     *
     * @param {PrecisionNumberValue} value - Value to compare
     *
     * @returns {boolean} `true` when both numeric values are equal
     */
    equals(value: PrecisionNumberValue) {
        return this.#decimal.equals(value.toString().trim());
    }

    /**
     * Checks whether the current value is greater than another value.
     */
    gt(value: PrecisionNumberValue) {
        return this.#decimal.gt(value.toString().trim());
    }

    /**
     * Checks whether the current value is greater than or equal to another value.
     */
    gte(value: PrecisionNumberValue) {
        return this.#decimal.gte(value.toString().trim());
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
        return this.#decimal.lt(value.toString().trim());
    }

    /**
     * Checks whether the current value is less than or equal to another value.
     */
    lte(value: PrecisionNumberValue) {
        return this.#decimal.lte(value.toString().trim());
    }

    /**
     * Subtracts another value from the current value in place.
     */
    minus(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.minus(value.toString().trim()));
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
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.plus(value.toString().trim()));
        return this;
    }

    /**
     * Multiplies the current value by another value in place.
     */
    times(value: PrecisionNumberValue) {
        this.#decimal = this.#decimalToFixedDecimal(this.#decimal.times(value.toString().trim()));
        return this;
    }

    /**
     * Returns a new instance with the absolute value.
     */
    toAbsoluteValue() {
        return new PrecisionNumber(this.#decimal.absoluteValue(), this.#decimalPlaces, this.#rounding);
    }

    /**
     * Returns a new instance divided by another value.
     */
    toDividedBy(value: PrecisionNumberValue) {
        return new PrecisionNumber(
            this.#decimal.dividedBy(value.toString().trim()),
            this.#decimalPlaces,
            this.#rounding,
        );
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
        return new PrecisionNumber(this.#decimal.minus(value.toString().trim()), this.#decimalPlaces, this.#rounding);
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
        return new PrecisionNumber(this.#decimal.plus(value.toString().trim()), this.#decimalPlaces, this.#rounding);
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
        return new PrecisionNumber(this.#decimal.times(value.toString().trim()), this.#decimalPlaces, this.#rounding);
    }
}
