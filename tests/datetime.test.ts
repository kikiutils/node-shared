import { enUS } from 'date-fns/locale';
import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { EnhancedDate } from '../src/classes/enhanced-date';
import {
    formatDate,
    getDateRangeFromDate,
} from '../src/datetime';

afterEach(() => {
    vi.useRealTimers();
});

describe('formatDate', () => {
    it.for([
        {
            input: new Date(2024, 6, 10),
            name: 'a Date',
        },
        {
            input: new Date(2024, 6, 10).getTime(),
            name: 'a millisecond timestamp',
        },
        {
            input: '2024-07-10T00:00:00',
            name: 'a local date string',
        },
    ])(
        'should format $name using the supplied pattern',
        ({ input }, { expect }) => {
            expect(formatDate(input, 'yyyy-MM-dd')).toBe('2024-07-10');
        },
    );

    it('should apply the default pattern and forward locale options without changing the input', ({ expect }) => {
        const input = new Date(2024, 6, 10, 12, 34, 56);
        const originalTime = input.getTime();

        expect(formatDate(input)).toBe('2024-07-10 12:34:56');
        expect(formatDate(input, 'MMMM', { locale: enUS })).toBe('July');
        expect(input.getTime()).toBe(originalTime);
    });

    it('should reject an invalid date rather than substituting the current time', ({ expect }) => {
        expect(() => formatDate(new Date(Number.NaN))).toThrow(RangeError);
    });
});

describe('getDateRangeFromDate', () => {
    it.for([
        {
            end: new Date(2023, 5, 30, 23, 59, 59, 999),
            start: new Date(2023, 5, 1),
            type: 'lastMonth',
        },
        {
            end: new Date(2023, 5, 25, 23, 59, 59, 999),
            start: new Date(2023, 5, 19),
            type: 'lastWeek',
        },
        {
            end: new Date(2023, 6, 31, 23, 59, 59, 999),
            start: new Date(2023, 6, 1),
            type: 'thisMonth',
        },
        {
            end: new Date(2023, 6, 2, 23, 59, 59, 999),
            start: new Date(2023, 5, 26),
            type: 'thisWeek',
        },
        {
            end: new Date(2023, 6, 1, 23, 59, 59, 999),
            start: new Date(2023, 6, 1),
            type: 'today',
        },
        {
            end: new Date(2023, 5, 30, 23, 59, 59, 999),
            start: new Date(2023, 5, 30),
            type: 'yesterday',
        },
    ] as const)(
        'should return independent inclusive $type boundaries without mutating the input',
        (
            {
                end,
                start,
                type,
            },
            { expect },
        ) => {
            const input = new Date(2023, 6, 1, 12);
            const originalTime = input.getTime();

            const result = getDateRangeFromDate(input, type);

            expect(result.startDate).toBeInstanceOf(EnhancedDate);
            expect(result.endDate).toBeInstanceOf(EnhancedDate);
            expect(result.startDate).not.toBe(result.endDate);
            expect(result.startDate.getTime()).toBe(start.getTime());
            expect(result.endDate.getTime()).toBe(end.getTime());
            result.startDate.addDays(1);

            expect(input.getTime()).toBe(originalTime);
            expect(result.endDate.getTime()).toBe(end.getTime());
        },
    );

    it.for([
        {
            end: new Date(2023, 5, 24, 23, 59, 59, 999),
            start: new Date(2023, 5, 18),
            type: 'lastWeek',
        },
        {
            end: new Date(2023, 6, 1, 23, 59, 59, 999),
            start: new Date(2023, 5, 25),
            type: 'thisWeek',
        },
    ] as const)(
        'should respect a Sunday start for $type',
        (
            {
                end,
                start,
                type,
            },
            { expect },
        ) => {
            const result = getDateRangeFromDate(new Date(2023, 6, 1, 12), type, { weekStartsOn: 0 });

            expect(result.startDate.getTime()).toBe(start.getTime());
            expect(result.endDate.getTime()).toBe(end.getTime());
        },
    );

    it('should preserve leap-month boundaries and an exclusive next-day end', ({ expect }) => {
        const result = getDateRangeFromDate(new Date(2024, 2, 31, 12), 'lastMonth', { setEndDateToNextDayStart: true });

        expect(result.startDate.getTime()).toBe(new Date(2024, 1, 1).getTime());
        expect(result.endDate.getTime()).toBe(new Date(2024, 2, 1).getTime());
    });

    it('should reject an unsupported range type', ({ expect }) => {
        // @ts-expect-error Exercise the runtime guard beyond the DateRangeType union.
        expect(() => getDateRangeFromDate(new Date(2023, 6, 1), 'invalid')).toThrow(
            'Unsupported date range type: invalid',
        );
    });
});

describe('getMidnightDateFromToday', () => {
    it.for([
        {
            expected: new Date(2024, 1, 28),
            offset: -1,
        },
        {
            expected: new Date(2024, 1, 29),
            offset: undefined,
        },
        {
            expected: new Date(2024, 2, 1),
            offset: 1,
        },
    ])(
        'should return local midnight with offset $offset',
        async ({ expected, offset }, { expect }) => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2024, 1, 29, 12, 34, 56));

            // A Date subclass captures its base constructor at module evaluation time.
            vi.resetModules();
            const { getMidnightDateFromToday: fromClock } = await import('../src/datetime');
            const { EnhancedDate: ClockDate } = await import('../src/classes/enhanced-date');

            const result = fromClock(offset);

            expect(result).toBeInstanceOf(ClockDate);
            expect(result.getTime()).toBe(expected.getTime());
        },
    );
});
