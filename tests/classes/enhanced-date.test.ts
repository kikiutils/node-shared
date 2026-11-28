import * as dateFns from 'date-fns';
import {
    enUS,
    fr,
} from 'date-fns/locale';
import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { EnhancedDate } from '../../src/classes/enhanced-date';

describe('class EnhancedDate', () => {
    describe('native Date compatibility', () => {
        it('should inherit native construction and copy Date inputs independently', ({ expect }) => {
            const original = new Date(2026, 0, 15, 12, 34, 56, 789);
            const date = new EnhancedDate(original);

            expect(date).toBeInstanceOf(Date);
            expect(date.getTime()).toBe(original.getTime());

            date.addDays(1);

            expect(original.getDate()).toBe(15);
        });

        it('should retain EnhancedDate methods when passed to external date-fns operations', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 15);
            const result = dateFns.addDays(date, 1);

            expect(result).toBeInstanceOf(EnhancedDate);
            expect(result.format('yyyy-MM-dd')).toBe('2026-01-16');
            expect(date.getDate()).toBe(15);
        });
    });

    describe('mutable and immutable operations', () => {
        it.for([
            {
                args: [3],
                expected: new Date(2024, 1, 17, 13, 45, 30, 123),
                method: 'addDays',
            },
            {
                args: [2],
                expected: new Date(2024, 1, 14, 15, 45, 30, 123),
                method: 'addHours',
            },
            {
                args: [23],
                expected: new Date(2024, 1, 14, 13, 45, 30, 146),
                method: 'addMilliseconds',
            },
            {
                args: [5],
                expected: new Date(2024, 1, 14, 13, 50, 30, 123),
                method: 'addMinutes',
            },
            {
                args: [1],
                expected: new Date(2024, 2, 14, 13, 45, 30, 123),
                method: 'addMonths',
            },
            {
                args: [10],
                expected: new Date(2024, 1, 14, 13, 45, 40, 123),
                method: 'addSeconds',
            },
            {
                args: [1],
                expected: new Date(2024, 1, 21, 13, 45, 30, 123),
                method: 'addWeeks',
            },
            {
                args: [1],
                expected: new Date(2025, 1, 14, 13, 45, 30, 123),
                method: 'addYears',
            },
            {
                args: [],
                expected: new Date(2024, 1, 14, 23, 59, 59, 999),
                method: 'endOfDay',
            },
            {
                args: [],
                expected: new Date(2024, 1, 14, 13, 45, 59, 999),
                method: 'endOfMinute',
            },
            {
                args: [],
                expected: new Date(2024, 1, 29, 23, 59, 59, 999),
                method: 'endOfMonth',
            },
            {
                args: [],
                expected: new Date(2024, 1, 17, 23, 59, 59, 999),
                method: 'endOfWeek',
            },
            {
                args: [],
                expected: new Date(2024, 1, 14),
                method: 'startOfDay',
            },
            {
                args: [],
                expected: new Date(2024, 1, 14, 13, 45),
                method: 'startOfMinute',
            },
            {
                args: [],
                expected: new Date(2024, 1, 1),
                method: 'startOfMonth',
            },
            {
                args: [],
                expected: new Date(2024, 1, 11),
                method: 'startOfWeek',
            },
            {
                args: [3],
                expected: new Date(2024, 1, 11, 13, 45, 30, 123),
                method: 'subDays',
            },
            {
                args: [2],
                expected: new Date(2024, 1, 14, 11, 45, 30, 123),
                method: 'subHours',
            },
            {
                args: [23],
                expected: new Date(2024, 1, 14, 13, 45, 30, 100),
                method: 'subMilliseconds',
            },
            {
                args: [5],
                expected: new Date(2024, 1, 14, 13, 40, 30, 123),
                method: 'subMinutes',
            },
            {
                args: [2],
                expected: new Date(2023, 11, 14, 13, 45, 30, 123),
                method: 'subMonths',
            },
            {
                args: [10],
                expected: new Date(2024, 1, 14, 13, 45, 20, 123),
                method: 'subSeconds',
            },
            {
                args: [1],
                expected: new Date(2024, 1, 7, 13, 45, 30, 123),
                method: 'subWeeks',
            },
            {
                args: [4],
                expected: new Date(2020, 1, 14, 13, 45, 30, 123),
                method: 'subYears',
            },
        ] as const)(
            'should apply the matching date-fns operation in $method and its to-prefixed counterpart',
            (
                {
                    args,
                    expected,
                    method,
                },
                { expect },
            ) => {
                type Operation = (...values: readonly unknown[]) => EnhancedDate;

                const date = new EnhancedDate(2024, 1, 14, 13, 45, 30, 123);
                const originalTime = date.getTime();
                const immutable = `to${method.charAt(0).toUpperCase()}${method.slice(1)}` as `to${Capitalize<typeof method>}`;
                const result = (date[immutable] as Operation)(...args);

                expect(result).toBeInstanceOf(EnhancedDate);
                expect(result).not.toBe(date);
                expect(result.getTime()).toBe(expected.getTime());
                expect(date.getTime()).toBe(originalTime);
                expect((date[method] as Operation)(...args)).toBe(date);
                expect(date.getTime()).toBe(expected.getTime());
            },
        );

        it('should clamp month and year arithmetic at month ends and leap days', ({ expect }) => {
            const january = new EnhancedDate(2026, 0, 31, 12);
            const leapDay = new EnhancedDate(2024, 1, 29, 12);

            expect(january.toAddMonths(1).getTime()).toBe(new Date(2026, 1, 28, 12).getTime());
            expect(new EnhancedDate(2026, 2, 31, 12).subMonths(1).getTime())
                .toBe(new Date(2026, 1, 28, 12).getTime());

            expect(leapDay.toAddYears(1).getTime()).toBe(new Date(2025, 1, 28, 12).getTime());
            expect(leapDay.subYears(1).getTime()).toBe(new Date(2023, 1, 28, 12).getTime());
            expect(january.getDate()).toBe(31);
        });

        it.for([
            {
                input: new Date(2026, 2, 7, 12),
                name: 'spring-forward transition',
                next: new Date(2026, 2, 8, 12),
                nextMonth: new Date(2026, 3, 7, 12),
                nextWeek: new Date(2026, 2, 14, 12),
            },
            {
                input: new Date(2026, 9, 31, 12),
                name: 'fall-back transition',
                next: new Date(2026, 10, 1, 12),
                nextMonth: new Date(2026, 10, 30, 12),
                nextWeek: new Date(2026, 10, 7, 12),
            },
        ])(
            'should preserve calendar time across the $name',
            (
                {
                    input,
                    next,
                    nextMonth,
                    nextWeek,
                },
                {
                    expect,
                    skip,
                },
            ) => {
                skip(input.getTimezoneOffset() === next.getTimezoneOffset(), 'The time zone has no transition on these dates');

                const date = new EnhancedDate(input);
                const elapsedDay = date.toAddHours(24);

                expect(date.toAddDays(1).getTime()).toBe(next.getTime());
                expect(date.toAddWeeks(1).getTime()).toBe(nextWeek.getTime());
                expect(date.toAddMonths(1).getTime()).toBe(nextMonth.getTime());
                expect(elapsedDay.getTime()).toBe(input.getTime() + 86_400_000);
                expect(elapsedDay.getTime()).not.toBe(next.getTime());
                expect(date.getTime()).toBe(input.getTime());
            },
        );

        it.runIf(new Date(2026, 2, 7, 12).getTimezoneOffset() !== new Date(2026, 2, 8, 12).getTimezoneOffset())(
            'should span 23 hours between the start and end of the spring-forward day',
            ({ expect }) => {
                const date = new EnhancedDate(2026, 2, 8, 12);
                const start = date.toStartOfDay();
                const end = date.toEndOfDay();

                expect(start.getTime()).toBe(new Date(2026, 2, 8).getTime());
                expect(end.getTime()).toBe(new Date(2026, 2, 8, 23, 59, 59, 999).getTime());
                expect(end.getTime() - start.getTime() + 1).toBe(23 * 3_600_000);
            },
        );

        it('should forward week and context options to boundary results', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 7, 12, 34, 56, 789);
            const evening = new EnhancedDate(2026, 0, 15, 20);
            const halfDay = 12 * 3_600_000;
            const shiftByHalfDay = (value: dateFns.DateArg<Date> & {}) => new Date(new Date(value).getTime() + halfDay);

            expect(date.toStartOfWeek({ weekStartsOn: 1 }).getTime()).toBe(new Date(2026, 0, 5).getTime());
            expect(date.toEndOfWeek({ weekStartsOn: 1 }).getTime())
                .toBe(new Date(2026, 0, 11, 23, 59, 59, 999).getTime());

            expect(evening.toStartOfDay().getDate()).toBe(15);
            expect(evening.toStartOfDay({ in: shiftByHalfDay }).getDate()).toBe(16);
        });

        it('should distinguish EnhancedDate clones from independent plain Date copies', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 15);
            const clone = date.clone();
            const native = date.toDate();

            expect(clone).toBeInstanceOf(EnhancedDate);
            expect(native.constructor).toBe(Date);
            expect(clone.getTime()).toBe(date.getTime());
            expect(native.getTime()).toBe(date.getTime());

            clone.addDays(1);
            native.setDate(17);

            expect(date.getDate()).toBe(15);
        });
    });

    describe('factories and formatting', () => {
        it('should distinguish Unix seconds from native millisecond timestamps', ({ expect }) => {
            const date = EnhancedDate.fromUnixSeconds(1700000000.5);

            expect(date).toBeInstanceOf(EnhancedDate);
            expect(date.getTime()).toBe(1700000000500);
            expect(date.getUnixTime()).toBe(1700000000);
            expect(new EnhancedDate(1700000000.5).getTime()).toBe(1700000000);
        });

        it('should parse local ISO dates and apply the reference year and locale', ({ expect }) => {
            const iso = EnhancedDate.fromISO('2024-02-29');
            const formatted = EnhancedDate.fromFormat('28 February', 'dd MMMM', new Date(2026, 0, 1), { locale: enUS });

            expect(iso).toBeInstanceOf(EnhancedDate);
            expect(iso.getTime()).toBe(new Date(2024, 1, 29).getTime());
            expect(formatted).toBeInstanceOf(EnhancedDate);
            expect(formatted.getTime()).toBe(new Date(2026, 1, 28).getTime());
        });

        it('should map ISO strings with a Z or an explicit offset to the matching UTC instant', ({ expect }) => {
            const instant = Date.UTC(2026, 0, 15);

            expect(EnhancedDate.fromISO('2026-01-15T00:00:00Z').getTime()).toBe(instant);
            expect(EnhancedDate.fromISO('2026-01-15T05:30:00+05:30').getTime()).toBe(instant);
        });

        it('should support the default pattern and forward explicit patterns and locale options', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 15, 12, 34, 56);

            expect(date.format()).toBe('2026-01-15 12:34:56');
            expect(date.format('yyyy/MM/dd')).toBe('2026/01/15');
            expect(date.format('MMMM', { locale: enUS })).toBe('January');
            expect(date.format('MMMM', { locale: fr })).toBe('janvier');
        });

        it('should preserve invalid dates rather than replacing them with now or fallback text', ({ expect }) => {
            const date = EnhancedDate.fromISO('not-a-date');

            expect(date.isValid()).toBe(false);
            expect(EnhancedDate.fromFormat('31/02/2026', 'dd/MM/yyyy', new Date(2026, 0, 1)).isValid())
                .toBe(false);

            expect(date.clone().isValid()).toBe(false);
            expect(Number.isNaN(date.toDate().getTime())).toBe(true);
            expect(date.toAddDays(1).isValid()).toBe(false);
            expect(date.isAfter(new Date(2026, 0, 1))).toBe(false);
            expect(() => date.format()).toThrow(RangeError);
        });
    });

    describe('static extremes', () => {
        it('should return the latest and earliest of mixed Date and timestamp inputs', ({ expect }) => {
            const early = new Date(2024, 0, 1, 8);
            const middle = new Date(2024, 5, 15, 12);
            const late = new Date(2025, 11, 31, 23);
            const inputs = [
                middle,
                late.getTime(),
                early,
            ];

            const latest = EnhancedDate.max(inputs);
            const earliest = EnhancedDate.min(inputs);

            expect(latest).toBeInstanceOf(EnhancedDate);
            expect(earliest).toBeInstanceOf(EnhancedDate);
            expect(latest.getTime()).toBe(late.getTime());
            expect(earliest.getTime()).toBe(early.getTime());
            expect(EnhancedDate.max([]).isValid()).toBe(false);
            expect(EnhancedDate.min([]).isValid()).toBe(false);
        });
    });

    describe('comparison and differences', () => {
        it('should compare accepted date inputs without mutating either date', ({ expect }) => {
            const earlier = new EnhancedDate(2026, 0, 15, 12);
            const later = earlier.toAddMinutes(1);

            expect(later.isAfter(earlier.toISOString())).toBe(true);
            expect(earlier.isBefore(later.getTime())).toBe(true);
            expect(earlier.isEqual(new Date(earlier))).toBe(true);
            expect(later.isSameDay(earlier)).toBe(true);
            expect(later.isSameMinute(earlier)).toBe(false);
            expect(earlier.getHours()).toBe(12);
            expect(earlier.getMinutes()).toBe(0);
        });

        it('should return this date minus the other date from difference methods', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 10, 23, 59);
            const later = date.toAddSeconds(90);

            expect(date.differenceInMinutes(later)).toBe(-1);
            expect(later.differenceInMinutes(date)).toBe(1);
            expect(later.differenceInSeconds(date)).toBe(90);
            expect(date.differenceInSeconds(later.getTime())).toBe(-90);
            expect(later.differenceInCalendarDays(date)).toBe(1);
            expect(date.differenceInCalendarDays(later)).toBe(-1);
            expect(later.differenceInCalendarWeeks(date)).toBe(1);
            expect(date.differenceInCalendarWeeks(later)).toBe(-1);
        });
    });

    describe('current-time operations', () => {
        afterEach(() => {
            vi.useRealTimers();
        });

        it('should derive today boundaries and relative results from the current clock', ({ expect }) => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 15, 12));

            const start = EnhancedDate.startOfToday();
            const end = EnhancedDate.endOfToday();
            const tomorrow = start.toAddDays(1);

            expect(start).toBeInstanceOf(EnhancedDate);
            expect(end).toBeInstanceOf(EnhancedDate);
            expect(start.getTime()).toBe(new Date(2026, 0, 15).getTime());
            expect(end.getTime()).toBe(new Date(2026, 0, 15, 23, 59, 59, 999).getTime());
            expect(start.isToday()).toBe(true);
            expect(tomorrow.isToday()).toBe(false);
            expect(tomorrow.isTomorrow()).toBe(true);
            expect(tomorrow.isFuture()).toBe(true);
            expect(start.isFuture()).toBe(false);
            expect(
                new EnhancedDate(2026, 0, 15, 11).formatDistanceToNow({
                    addSuffix: true,
                    locale: enUS,
                }),
            ).toBe('about 1 hour ago');
        });
    });
});
