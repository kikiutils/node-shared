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

// Bounds the length of the fixed-notation output, which `pow` and `Decimal` inputs could otherwise make unbounded.
const maxIntegerDigits = 1000;

// Bounds the fractional output, which decimal.js would allow up to 1e9 places. Division and powers keep 100
// significant digits, so they stay exact to 50 places for results below 10^50.
const maxDecimalPlaces = 50;

// Plain decimal notation only: decimal.js would also accept hex, binary, octal, exponent notation, `NaN`, and
// `Infinity`.
const decimalStringPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

export type PrecisionNumberValue = Decimal.Value | PrecisionNumber;

/** A result that is not finite or exceeds the magnitude limit throws `RangeError` and leaves the value unchanged. */
export class PrecisionNumber {
    readonly #decimalPlaces: number;
    readonly #rounding: Decimal.Rounding;
    #decimal: Decimal;

    constructor(
        value: PrecisionNumberValue = '0',
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        validateFormat(decimalPlaces, rounding);
        this.#decimalPlaces = decimalPlaces;
        this.#rounding = rounding;
        this.#decimal = this.#round(PrecisionNumber.#toDecimal(value));
    }

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
            // The magnitude limit is enforced when rounding, the same way as for the other value types.
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

    #round(decimal: Decimal) {
        // decimal.js keeps the operand's constructor, so rewrapping stops `BoundedDecimal` results from rounding later
        // arithmetic at 100 digits.
        let rounded = decimal.toDecimalPlaces(this.#decimalPlaces, this.#rounding);
        if (rounded.constructor !== ExactDecimal) rounded = new ExactDecimal(rounded);
        if (!rounded.isFinite()) throw new RangeError('Result is not finite');
        if (rounded.e >= maxIntegerDigits) throw new RangeError('Result exceeds the supported magnitude');
        return rounded.isZero() ? new ExactDecimal(0) : rounded;
    }

    #set(decimal: Decimal) {
        this.#decimal = this.#round(decimal);
        return this;
    }

    get decimalPlaces() {
        return this.#decimalPlaces;
    }

    get rounding() {
        return this.#rounding;
    }

    get value() {
        return this.#decimal.toFixed(this.#decimalPlaces, this.#rounding);
    }

    static toFixed(
        value: PrecisionNumberValue,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        return new PrecisionNumber(value, decimalPlaces, rounding).value;
    }

    /** Only an invalid value returns `undefined`; invalid `decimalPlaces` or `rounding` arguments throw. */
    static tryFrom(
        value: unknown,
        decimalPlaces: number = 2,
        rounding: Decimal.Rounding = Decimal.ROUND_DOWN,
    ) {
        const instance = new PrecisionNumber('0', decimalPlaces, rounding);
        const decimal = PrecisionNumber.#parse(value);
        if (!decimal) return;
        try {
            return instance.#set(decimal);
        } catch {
            // Rounding only throws `RangeError` for values beyond the supported magnitude.
        }
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.value;
    }

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
     * The bounds apply before rounding, so a bound with more decimal places than this instance can round outside the
     * range.
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

    isNegative() {
        return this.#decimal.lt(0);
    }

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

    toClamped(min: PrecisionNumberValue, max: PrecisionNumberValue) {
        return this.clone().clamp(min, max);
    }

    toDividedBy(value: PrecisionNumberValue) {
        return this.clone().dividedBy(value);
    }

    toFixed(decimalPlaces: number = this.#decimalPlaces, rounding: Decimal.Rounding = this.#rounding) {
        validateFormat(decimalPlaces, rounding);
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

function validateFormat(decimalPlaces: number, rounding: number) {
    if (typeof decimalPlaces !== 'number') throw new TypeError(`decimalPlaces must be a number, got ${typeof decimalPlaces}`);
    if (typeof rounding !== 'number') throw new TypeError(`rounding must be a number, got ${typeof rounding}`);
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > maxDecimalPlaces) {
        throw new RangeError(`decimalPlaces must be an integer from 0 to ${maxDecimalPlaces}, got ${decimalPlaces}`);
    }

    if (!Number.isInteger(rounding) || rounding < Decimal.ROUND_UP || rounding > Decimal.ROUND_HALF_FLOOR) {
        throw new RangeError(`rounding must be a decimal.js rounding mode from 0 to 8, got ${rounding}`);
    }
}
