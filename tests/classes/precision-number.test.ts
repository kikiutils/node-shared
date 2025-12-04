import { Decimal } from 'decimal.js';
import {
    describe,
    expect,
    it,
} from 'vitest';

import { PrecisionNumber } from '../../src/classes/precision-number';

describe('precision number', () => {
    describe('constructor', () => {
        it('should create instance with default values', () => {
            const num = new PrecisionNumber();
            expect(num.value).toBe('0.00');
        });

        it('should create instance with string value', () => {
            const num = new PrecisionNumber('123.456');
            expect(num.value).toBe('123.45');
        });

        it('should create instance with number value', () => {
            const num = new PrecisionNumber(123.456);
            expect(num.value).toBe('123.45');
        });

        it('should create instance with PrecisionNumber value', () => {
            const num1 = new PrecisionNumber('100.50');
            const num2 = new PrecisionNumber(num1);
            expect(num2.value).toBe('100.50');
        });

        it('should respect custom decimal places', () => {
            const num = new PrecisionNumber('123.456789', 4);
            expect(num.value).toBe('123.4567');
        });

        it('should respect custom rounding mode', () => {
            const numDown = new PrecisionNumber('123.456', 2, Decimal.ROUND_DOWN);
            const numUp = new PrecisionNumber('123.456', 2, Decimal.ROUND_UP);
            expect(numDown.value).toBe('123.45');
            expect(numUp.value).toBe('123.46');
        });

        it('should trim whitespace from input', () => {
            const num = new PrecisionNumber('  123.45  ');
            expect(num.value).toBe('123.45');
        });
    });

    describe('static methods', () => {
        it('should convert to fixed string with toFixed', () => {
            const result = PrecisionNumber.toFixed('123.456789', 3);
            expect(result).toBe('123.456');
        });

        it('should use default decimal places in toFixed', () => {
            const result = PrecisionNumber.toFixed('123.456789');
            expect(result).toBe('123.45');
        });

        it('should respect rounding mode in toFixed', () => {
            const result = PrecisionNumber.toFixed('123.456', 2, Decimal.ROUND_UP);
            expect(result).toBe('123.46');
        });
    });

    describe('arithmetic operations (in-place)', () => {
        describe('plus', () => {
            it('should add positive numbers', () => {
                const num = new PrecisionNumber('100.50');
                num.plus('50.25');
                expect(num.value).toBe('150.75');
            });

            it('should add negative numbers', () => {
                const num = new PrecisionNumber('100.50');
                num.plus('-50.25');
                expect(num.value).toBe('50.25');
            });

            it('should handle chaining', () => {
                const num = new PrecisionNumber('10');
                num.plus('5').plus('3');
                expect(num.value).toBe('18.00');
            });
        });

        describe('minus', () => {
            it('should subtract positive numbers', () => {
                const num = new PrecisionNumber('100.50');
                num.minus('50.25');
                expect(num.value).toBe('50.25');
            });

            it('should subtract negative numbers', () => {
                const num = new PrecisionNumber('100.50');
                num.minus('-50.25');
                expect(num.value).toBe('150.75');
            });
        });

        describe('times', () => {
            it('should multiply numbers', () => {
                const num = new PrecisionNumber('10.50');
                num.times('2');
                expect(num.value).toBe('21.00');
            });

            it('should handle decimal multiplication', () => {
                const num = new PrecisionNumber('10.00');
                num.times('0.15');
                expect(num.value).toBe('1.50');
            });
        });

        describe('dividedBy', () => {
            it('should divide numbers', () => {
                const num = new PrecisionNumber('100.00');
                num.dividedBy('4');
                expect(num.value).toBe('25.00');
            });

            it('should handle decimal division', () => {
                const num = new PrecisionNumber('10.00');
                num.dividedBy('3');
                expect(num.value).toBe('3.33');
            });

            it('should respect rounding in division', () => {
                const num = new PrecisionNumber('10.00', 2, Decimal.ROUND_UP);
                num.dividedBy('3');
                expect(num.value).toBe('3.34');
            });
        });

        describe('absoluteValue', () => {
            it('should convert negative to positive', () => {
                const num = new PrecisionNumber('-123.45');
                num.absoluteValue();
                expect(num.value).toBe('123.45');
            });

            it('should keep positive as positive', () => {
                const num = new PrecisionNumber('123.45');
                num.absoluteValue();
                expect(num.value).toBe('123.45');
            });
        });

        describe('negate', () => {
            it('should negate positive to negative', () => {
                const num = new PrecisionNumber('123.45');
                num.negate();
                expect(num.value).toBe('-123.45');
            });

            it('should negate negative to positive', () => {
                const num = new PrecisionNumber('-123.45');
                num.negate();
                expect(num.value).toBe('123.45');
            });
        });
    });

    describe('arithmetic operations (immutable)', () => {
        describe('toPlus', () => {
            it('should return new instance with added value', () => {
                const num1 = new PrecisionNumber('100.50');
                const num2 = num1.toPlus('50.25');
                expect(num1.value).toBe('100.50');
                expect(num2.value).toBe('150.75');
            });
        });

        describe('toMinus', () => {
            it('should return new instance with subtracted value', () => {
                const num1 = new PrecisionNumber('100.50');
                const num2 = num1.toMinus('50.25');
                expect(num1.value).toBe('100.50');
                expect(num2.value).toBe('50.25');
            });
        });

        describe('toTimes', () => {
            it('should return new instance with multiplied value', () => {
                const num1 = new PrecisionNumber('10.50');
                const num2 = num1.toTimes('2');
                expect(num1.value).toBe('10.50');
                expect(num2.value).toBe('21.00');
            });
        });

        describe('toDividedBy', () => {
            it('should return new instance with divided value', () => {
                const num1 = new PrecisionNumber('100.00');
                const num2 = num1.toDividedBy('4');
                expect(num1.value).toBe('100.00');
                expect(num2.value).toBe('25.00');
            });
        });

        describe('toAbsoluteValue', () => {
            it('should return new instance with absolute value', () => {
                const num1 = new PrecisionNumber('-123.45');
                const num2 = num1.toAbsoluteValue();
                expect(num1.value).toBe('-123.45');
                expect(num2.value).toBe('123.45');
            });
        });

        describe('toNegated', () => {
            it('should return new instance with negated value', () => {
                const num1 = new PrecisionNumber('123.45');
                const num2 = num1.toNegated();
                expect(num1.value).toBe('123.45');
                expect(num2.value).toBe('-123.45');
            });
        });
    });

    describe('comparison methods', () => {
        describe('equals', () => {
            it('should return true for equal values', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.equals('123.45')).toBe(true);
            });

            it('should return false for different values', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.equals('123.46')).toBe(false);
            });
        });

        describe('gt (greater than)', () => {
            it('should return true when greater', () => {
                const num = new PrecisionNumber('100');
                expect(num.gt('50')).toBe(true);
            });

            it('should return false when not greater', () => {
                const num = new PrecisionNumber('50');
                expect(num.gt('100')).toBe(false);
                expect(num.gt('50')).toBe(false);
            });
        });

        describe('gte (greater than or equal)', () => {
            it('should return true when greater or equal', () => {
                const num = new PrecisionNumber('100');
                expect(num.gte('50')).toBe(true);
                expect(num.gte('100')).toBe(true);
            });

            it('should return false when less', () => {
                const num = new PrecisionNumber('50');
                expect(num.gte('100')).toBe(false);
            });
        });

        describe('lt (less than)', () => {
            it('should return true when less', () => {
                const num = new PrecisionNumber('50');
                expect(num.lt('100')).toBe(true);
            });

            it('should return false when not less', () => {
                const num = new PrecisionNumber('100');
                expect(num.lt('50')).toBe(false);
                expect(num.lt('100')).toBe(false);
            });
        });

        describe('lte (less than or equal)', () => {
            it('should return true when less or equal', () => {
                const num = new PrecisionNumber('50');
                expect(num.lte('100')).toBe(true);
                expect(num.lte('50')).toBe(true);
            });

            it('should return false when greater', () => {
                const num = new PrecisionNumber('100');
                expect(num.lte('50')).toBe(false);
            });
        });
    });

    describe('state checking methods', () => {
        describe('isFinite', () => {
            it('should return true for finite numbers', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isFinite()).toBe(true);
            });

            it('should return false for infinity', () => {
                const num = new PrecisionNumber('Infinity');
                expect(num.isFinite()).toBe(false);
            });
        });

        describe('isInteger', () => {
            it('should return true for integers', () => {
                const num = new PrecisionNumber('123.00');
                expect(num.isInteger()).toBe(true);
            });

            it('should return false for non-integers', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isInteger()).toBe(false);
            });
        });

        describe('isNaN', () => {
            it('should return false for valid numbers', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isNaN()).toBe(false);
            });

            it('should return true for NaN', () => {
                const num = new PrecisionNumber('NaN');
                expect(num.isNaN()).toBe(true);
            });
        });

        describe('isNegative', () => {
            it('should return true for negative numbers', () => {
                const num = new PrecisionNumber('-123.45');
                expect(num.isNegative()).toBe(true);
            });

            it('should return false for positive numbers', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isNegative()).toBe(false);
            });

            it('should return false for zero', () => {
                const num = new PrecisionNumber('0');
                expect(num.isNegative()).toBe(false);
            });
        });

        describe('isPositive', () => {
            it('should return true for positive numbers', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isPositive()).toBe(true);
            });

            it('should return false for negative numbers', () => {
                const num = new PrecisionNumber('-123.45');
                expect(num.isPositive()).toBe(false);
            });

            it('should return true for zero', () => {
                const num = new PrecisionNumber('0');
                expect(num.isPositive()).toBe(true);
            });
        });

        describe('isZero', () => {
            it('should return true for zero', () => {
                const num = new PrecisionNumber('0');
                expect(num.isZero()).toBe(true);
            });

            it('should return false for non-zero', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.isZero()).toBe(false);
            });
        });
    });

    describe('conversion methods', () => {
        describe('toString', () => {
            it('should return string representation', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.toString()).toBe('123.45');
            });
        });

        describe('toJSON', () => {
            it('should return value for JSON serialization', () => {
                const num = new PrecisionNumber('123.45');
                expect(num.toJSON()).toBe('123.45');
            });

            it('should work with JSON.stringify', () => {
                const num = new PrecisionNumber('123.45');
                expect(JSON.stringify({ value: num })).toBe('{"value":"123.45"}');
            });
        });

        describe('toFixed', () => {
            it('should format with default decimal places', () => {
                const num = new PrecisionNumber('123.456789', 4);
                expect(num.toFixed()).toBe('123.4567');
            });

            it('should format with custom decimal places', () => {
                const num = new PrecisionNumber('123.456789', 4);
                expect(num.toFixed(3)).toBe('123.456');
            });

            it('should format with custom rounding', () => {
                const num = new PrecisionNumber('123.456', 3);
                expect(num.toFixed(2, Decimal.ROUND_UP)).toBe('123.46');
            });
        });
    });

    describe('symbol methods', () => {
        describe('symbol.toPrimitive', () => {
            it('should convert to number when hint is number', () => {
                const num = new PrecisionNumber('123.45');
                expect(+num).toBe(123.45);
            });

            it('should convert to string when hint is string', () => {
                const num = new PrecisionNumber('123.45');
                expect(`${num}`).toBe('123.45');
            });

            it('should work in arithmetic operations', () => {
                const num = new PrecisionNumber('100.00');
                expect(+num + 50).toBe(150);
            });
        });
    });

    describe('edge cases', () => {
        it('should handle very large numbers', () => {
            const num = new PrecisionNumber('999999999999.99');
            expect(num.value).toBe('999999999999.99');
        });

        it('should handle very small numbers', () => {
            const num = new PrecisionNumber('0.0001', 4);
            expect(num.value).toBe('0.0001');
        });

        it('should handle scientific notation', () => {
            const num = new PrecisionNumber('1.23e+2');
            expect(num.value).toBe('123.00');
        });

        it('should handle zero decimal places', () => {
            const num = new PrecisionNumber('123.456', 0);
            expect(num.value).toBe('123');
        });

        it('should maintain precision in complex calculations', () => {
            const num = new PrecisionNumber('0.1', 10);
            num.plus('0.2');
            expect(num.value).toBe('0.3000000000');
        });
    });
});
