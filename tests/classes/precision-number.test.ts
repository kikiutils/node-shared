import { inspect } from 'node:util';

import { Decimal } from 'decimal.js';
import {
    describe,
    it,
} from 'vitest';

import { PrecisionNumber } from '../../src/classes/precision-number';

describe('class PrecisionNumber', () => {
    describe('construction and configuration', () => {
        it('should default to two decimal places and round toward zero', ({ expect }) => {
            const value = new PrecisionNumber();

            expect(value.value).toBe('0.00');
            expect(value.decimalPlaces).toBe(2);
            expect(value.rounding).toBe(Decimal.ROUND_DOWN);
        });

        it.for([
            {
                expected: '123.45',
                input: ' 123.456 ',
                name: 'a padded string',
            },
            {
                expected: '123.45',
                input: 123.456,
                name: 'a number',
            },
            {
                expected: '-123.45',
                input: '-123.456',
                name: 'a negative value',
            },
            {
                expected: '123.00',
                input: '1.23e2',
                name: 'scientific notation',
            },
            {
                expected: '9007199254740993.00',
                input: '9007199254740993',
                name: 'a value beyond safe native precision',
            },
        ])(
            'should normalize $name',
            ({ expected, input }, { expect }) => {
                expect(new PrecisionNumber(input).value).toBe(expected);
            },
        );

        it('should apply custom precision and rounding', ({ expect }) => {
            const value = new PrecisionNumber('123.456', 3, Decimal.ROUND_UP);

            expect(value.value).toBe('123.456');
            expect(value.decimalPlaces).toBe(3);
            expect(value.rounding).toBe(Decimal.ROUND_UP);
            expect(new PrecisionNumber('123.456', 2, Decimal.ROUND_UP).value).toBe('123.46');
            expect(new PrecisionNumber('123.456', 0).value).toBe('123');
        });

        it('should copy an instance value without sharing mutable state', ({ expect }) => {
            const original = new PrecisionNumber('100.50');
            const copy = new PrecisionNumber(original);

            copy.plus('1');

            expect(original.value).toBe('100.50');
            expect(copy.value).toBe('101.50');
        });

        it('should reject invalid decimal text', ({ expect }) => {
            expect(() => new PrecisionNumber('not-a-number')).toThrow(Error);
        });
    });

    describe('arithmetic and identity', () => {
        it.for([
            {
                expected: '150.75',
                immutable: 'toPlus',
                input: '100.50',
                mutable: 'plus',
                operand: '50.25',
            },
            {
                expected: '50.25',
                immutable: 'toPlus',
                input: '100.50',
                mutable: 'plus',
                operand: '-50.25',
            },
            {
                expected: '50.25',
                immutable: 'toMinus',
                input: '100.50',
                mutable: 'minus',
                operand: '50.25',
            },
            {
                expected: '150.75',
                immutable: 'toMinus',
                input: '100.50',
                mutable: 'minus',
                operand: '-50.25',
            },
            {
                expected: '21.00',
                immutable: 'toTimes',
                input: '10.50',
                mutable: 'times',
                operand: '2',
            },
            {
                expected: '1.50',
                immutable: 'toTimes',
                input: '10.00',
                mutable: 'times',
                operand: '0.15',
            },
            {
                expected: '25.00',
                immutable: 'toDividedBy',
                input: '100.00',
                mutable: 'dividedBy',
                operand: '4',
            },
            {
                expected: '3.33',
                immutable: 'toDividedBy',
                input: '10.00',
                mutable: 'dividedBy',
                operand: '3',
            },
            {
                expected: '2.50',
                immutable: 'toModulo',
                input: '10.50',
                mutable: 'modulo',
                operand: '4',
            },
            {
                expected: '8.00',
                immutable: 'toPow',
                input: '2.00',
                mutable: 'pow',
                operand: '3',
            },
        ] as const)(
            'should preserve mutable and immutable contracts for $mutable($operand) on $input',
            (
                {
                    expected,
                    immutable,
                    input,
                    mutable,
                    operand,
                },
                { expect },
            ) => {
                const original = new PrecisionNumber(input);

                const copy = original[immutable](operand);

                expect(copy).toBeInstanceOf(PrecisionNumber);
                expect(copy).not.toBe(original);
                expect(copy.value).toBe(expected);
                expect(copy.decimalPlaces).toBe(original.decimalPlaces);
                expect(copy.rounding).toBe(original.rounding);
                expect(original.value).toBe(input);
                expect(original[mutable](operand)).toBe(original);
                expect(original.value).toBe(expected);
            },
        );

        it.for([
            {
                expected: '123.45',
                immutable: 'toAbsoluteValue',
                input: '-123.45',
                mutable: 'absoluteValue',
            },
            {
                expected: '123.45',
                immutable: 'toAbsoluteValue',
                input: '123.45',
                mutable: 'absoluteValue',
            },
            {
                expected: '-123.45',
                immutable: 'toNegated',
                input: '123.45',
                mutable: 'negate',
            },
            {
                expected: '123.45',
                immutable: 'toNegated',
                input: '-123.45',
                mutable: 'negate',
            },
            {
                expected: '2.00',
                immutable: 'toCeil',
                input: '1.01',
                mutable: 'ceil',
            },
            {
                expected: '1.00',
                immutable: 'toFloor',
                input: '1.99',
                mutable: 'floor',
            },
        ] as const)(
            'should preserve mutable and immutable contracts for $mutable on $input',
            (
                {
                    expected,
                    immutable,
                    input,
                    mutable,
                },
                { expect },
            ) => {
                const original = new PrecisionNumber(input);

                const copy = original[immutable]();

                expect(copy).not.toBe(original);
                expect(copy.value).toBe(expected);
                expect(original.value).toBe(input);
                expect(original[mutable]()).toBe(original);
                expect(original.value).toBe(expected);
            },
        );

        it('should retain custom precision and rounding after immutable and mutable division', ({ expect }) => {
            const original = new PrecisionNumber('10', 3, Decimal.ROUND_UP);
            const copy = original.toDividedBy('3');

            expect(copy.value).toBe('3.334');
            expect(copy.decimalPlaces).toBe(3);
            expect(copy.rounding).toBe(Decimal.ROUND_UP);
            expect(original.value).toBe('10.000');
            expect(original.dividedBy('3')).toBe(original);
            expect(original.value).toBe('3.334');
        });

        it('should preserve decimal precision during chained arithmetic', ({ expect }) => {
            const value = new PrecisionNumber('0.1', 10);

            expect(value.plus('0.2').times('10')).toBe(value);
            expect(value.value).toBe('3.0000000000');
        });

        it.for([
            {
                expected: '2.00',
                input: '1.00',
            },
            {
                expected: '2.00',
                input: '2.00',
            },
            {
                expected: '3.00',
                input: '3.00',
            },
            {
                expected: '4.00',
                input: '4.00',
            },
            {
                expected: '4.00',
                input: '5.00',
            },
        ])(
            'should clamp $input inclusively without mutating the original',
            ({ expected, input }, { expect }) => {
                const original = new PrecisionNumber(input);
                const copy = original.toClamped('2', '4');

                expect(copy).not.toBe(original);
                expect(copy.value).toBe(expected);
                expect(original.value).toBe(input);
                expect(original.clamp('2', '4')).toBe(original);
                expect(original.value).toBe(expected);
            },
        );

        it('should reject inverted clamp bounds without changing the current value', ({ expect }) => {
            const value = new PrecisionNumber('3');

            expect(() => value.clamp('4', '2')).toThrow('Invalid clamp range');
            expect(() => value.toClamped('4', '2')).toThrow('Invalid clamp range');
            expect(value.value).toBe('3.00');
        });
    });

    describe('comparison and predicates', () => {
        it.for([
            {
                equals: false,
                gt: false,
                gte: false,
                input: '49',
                lt: true,
                lte: true,
            },
            {
                equals: true,
                gt: false,
                gte: true,
                input: '50',
                lt: false,
                lte: true,
            },
            {
                equals: false,
                gt: true,
                gte: true,
                input: '51',
                lt: false,
                lte: false,
            },
        ])(
            'should distinguish strict and inclusive comparisons for $input against 50',
            (
                {
                    equals,
                    gt,
                    gte,
                    input,
                    lt,
                    lte,
                },
                { expect },
            ) => {
                const value = new PrecisionNumber(input);

                expect(value.equals('50')).toBe(equals);
                expect(value.gt('50')).toBe(gt);
                expect(value.gte('50')).toBe(gte);
                expect(value.lt('50')).toBe(lt);
                expect(value.lte('50')).toBe(lte);
            },
        );

        it.for([
            {
                finite: true,
                input: '1.25',
                integer: false,
                nan: false,
                negative: false,
                positive: true,
                zero: false,
            },
            {
                finite: true,
                input: '-1',
                integer: true,
                nan: false,
                negative: true,
                positive: false,
                zero: false,
            },
            {
                finite: true,
                input: '0',
                integer: true,
                nan: false,
                negative: false,
                positive: true,
                zero: true,
            },
            {
                finite: false,
                input: 'Infinity',
                integer: false,
                nan: false,
                negative: false,
                positive: true,
                zero: false,
            },
            {
                finite: false,
                input: 'NaN',
                integer: false,
                nan: true,
                negative: false,
                positive: false,
                zero: false,
            },
        ])(
            'should expose numeric state predicates for $input',
            (
                {
                    finite,
                    input,
                    integer,
                    nan,
                    negative,
                    positive,
                    zero,
                },
                { expect },
            ) => {
                const value = new PrecisionNumber(input);

                expect(value.isFinite()).toBe(finite);
                expect(value.isInteger()).toBe(integer);
                expect(value.isNaN()).toBe(nan);
                expect(value.isNegative()).toBe(negative);
                expect(value.isPositive()).toBe(positive);
                expect(value.isZero()).toBe(zero);
            },
        );
    });

    describe('conversion and formatting', () => {
        it('should clone the value and configuration without sharing state', ({ expect }) => {
            const original = new PrecisionNumber('1.234', 3, Decimal.ROUND_UP);
            const copy = original.clone();

            copy.plus('1');

            expect(original.value).toBe('1.234');
            expect(copy.value).toBe('2.234');
            expect(copy.decimalPlaces).toBe(3);
            expect(copy.rounding).toBe(Decimal.ROUND_UP);
        });

        it('should expose fixed text for serialization and numeric values for numeric coercion', ({ expect }) => {
            const value = new PrecisionNumber('123.45');

            expect(value.toNumber()).toBe(123.45);
            expect(+value).toBe(123.45);
            expect(value.toString()).toBe('123.45');
            expect(`${value}`).toBe('123.45');
            expect(inspect(value)).toBe('123.45');
            expect(value.toJSON()).toBe('123.45');
            expect(JSON.stringify({ value })).toBe('{"value":"123.45"}');
        });

        it('should format with per-call precision and rounding without changing stored configuration', ({ expect }) => {
            const value = new PrecisionNumber('123.456', 3);

            expect(value.toFixed()).toBe('123.456');
            expect(value.toFixed(2)).toBe('123.45');
            expect(value.toFixed(2, Decimal.ROUND_UP)).toBe('123.46');
            expect(value.value).toBe('123.456');
            expect(value.decimalPlaces).toBe(3);
            expect(value.rounding).toBe(Decimal.ROUND_DOWN);
        });

        it('should format static inputs using default or explicit configuration', ({ expect }) => {
            expect(PrecisionNumber.toFixed(' 123.456 ')).toBe('123.45');
            expect(PrecisionNumber.toFixed('123.456', 3)).toBe('123.456');
            expect(PrecisionNumber.toFixed('123.456', 2, Decimal.ROUND_UP)).toBe('123.46');
        });
    });
});
