import { fr } from 'date-fns/locale';
import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { EnhancedDate } from '../src/classes/enhanced-date';
import {
    formatDate,
    formatOptionalDate,
    getDateRangeFromDate,
} from '../src/datetime';

afterEach(() => {
    vi.useRealTimers();
});

describe('formatDate', () => {
    it('should apply the default pattern and forward explicit patterns and options', ({ expect }) => {
        const input = new Date(2024, 6, 10, 12, 34, 56);

        expect(formatDate(input)).toBe('2024-07-10 12:34:56');
        expect(formatDate(input, 'yyyy/MM/dd')).toBe('2024/07/10');
        expect(formatDate(input, 'MMMM', { locale: fr })).toBe('juillet');
    });
});

describe('formatOptionalDate', () => {
    it.for([
        null,
        undefined,
    ])(
        'should return an empty string for %s',
        (date, { expect }) => {
            expect(formatOptionalDate(date)).toBe('');
        },
    );

    it('should format a present date, including a falsy timestamp, with the supplied pattern and options', ({ expect }) => {
        expect(formatOptionalDate(new Date(2024, 6, 10), 'yyyy-MM-dd')).toBe('2024-07-10');
        expect(formatOptionalDate(new Date(2024, 6, 10), 'MMMM', { locale: fr })).toBe('juillet');
        expect(formatOptionalDate(0, 'yyyy')).toBe(new Date(0).getFullYear().toString());
    });

    it('should reject an invalid date instead of rendering it as empty', ({ expect }) => {
        expect(() => formatOptionalDate(new Date(Number.NaN))).toThrow(RangeError);
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
            date: new Date(2023, 6, 1, 12),
            end: new Date(2023, 5, 24, 23, 59, 59, 999),
            options: { weekStartsOn: 0 },
            start: new Date(2023, 5, 18),
            type: 'lastWeek',
        },
        {
            date: new Date(2023, 6, 1, 12),
            end: new Date(2023, 6, 1, 23, 59, 59, 999),
            options: { weekStartsOn: 0 },
            start: new Date(2023, 5, 25),
            type: 'thisWeek',
        },
        {
            date: new Date(2023, 6, 2, 12),
            end: new Date(2023, 6, 2, 23, 59, 59, 999),
            options: undefined,
            start: new Date(2023, 5, 26),
            type: 'thisWeek',
        },
    ] as const)(
        'should place a $date reference in the $type week for options $options',
        (
            {
                date,
                end,
                options,
                start,
                type,
            },
            { expect },
        ) => {
            const result = getDateRangeFromDate(date, type, options);

            expect(result.startDate.getTime()).toBe(start.getTime());
            expect(result.endDate.getTime()).toBe(end.getTime());
        },
    );

    it('should preserve leap-month boundaries and an exclusive next-day end', ({ expect }) => {
        const result = getDateRangeFromDate(new Date(2024, 2, 31, 12), 'lastMonth', { setEndDateToNextDayStart: true });

        expect(result.startDate.getTime()).toBe(new Date(2024, 1, 1).getTime());
        expect(result.endDate.getTime()).toBe(new Date(2024, 2, 1).getTime());
    });

    // Run under a zone with daylight saving transitions (see the `test` script) to cover repeated and skipped hours.
    describe.for([
        new Date(2023, 6, 1, 12),
        new Date(2024, 3, 6, 12),
        new Date(2024, 3, 7, 12),
        new Date(2024, 8, 8, 12),
    ])(
        'with reference date %s',
        (referenceDate) => {
            it.for([
                'lastMonth',
                'lastWeek',
                'thisMonth',
                'thisWeek',
                'today',
                'yesterday',
            ] as const)(
                'should end $0 one millisecond before the next period starts',
                (type, { expect }) => {
                    for (const weekStartsOn of [
                        0,
                        1,
                    ] as const) {
                        const { endDate, startDate } = getDateRangeFromDate(referenceDate, type, { weekStartsOn });
                        const exclusiveRange = getDateRangeFromDate(
                            referenceDate,
                            type,
                            {
                                setEndDateToNextDayStart: true,
                                weekStartsOn,
                            },
                        );

                        const year = startDate.getFullYear();
                        const month = startDate.getMonth();
                        const day = startDate.getDate();
                        let nextStart: Date;
                        if (type === 'lastMonth' || type === 'thisMonth') nextStart = new Date(year, month + 1, 1);
                        else if (type === 'lastWeek' || type === 'thisWeek') nextStart = new Date(year, month, day + 7);
                        else nextStart = new Date(year, month, day + 1);

                        expect(endDate.getTime() + 1).toBe(nextStart.getTime());
                        expect(exclusiveRange.startDate.getTime()).toBe(startDate.getTime());
                        expect(exclusiveRange.endDate.getTime()).toBe(nextStart.getTime());
                    }
                },
            );
        },
    );

    it('should reject an unsupported range type', ({ expect }) => {
        // @ts-expect-error Exercise the runtime guard beyond the DateRangeType union.
        expect(() => getDateRangeFromDate(new Date(2023, 6, 1), 'invalid')).toThrow(TypeError);
    });
});

describe('getStartOfDayFromToday', () => {
    it.for([
        {
            expected: new Date(2024, 1, 28),
            now: new Date(2024, 1, 29, 12, 34, 56),
            offset: -1,
        },
        {
            expected: new Date(2024, 1, 29),
            now: new Date(2024, 1, 29, 12, 34, 56),
            offset: undefined,
        },
        {
            expected: new Date(2024, 2, 1),
            now: new Date(2024, 1, 29, 12, 34, 56),
            offset: 1,
        },
        {
            expected: new Date(2024, 8, 8),
            now: new Date(2024, 8, 7, 12),
            offset: 1,
        },
    ])(
        'should return the start of the local day for $now with offset $offset',
        async (
            {
                expected,
                now,
                offset,
            },
            { expect },
        ) => {
            vi.useFakeTimers();
            vi.setSystemTime(now);

            // A Date subclass captures its base constructor at module evaluation time.
            vi.resetModules();
            const { getStartOfDayFromToday: fromClock } = await import('../src/datetime');
            const { EnhancedDate: ClockDate } = await import('../src/classes/enhanced-date');

            const result = fromClock(offset);

            expect(result).toBeInstanceOf(ClockDate);
            expect(result.getTime()).toBe(expected.getTime());
        },
    );
});
