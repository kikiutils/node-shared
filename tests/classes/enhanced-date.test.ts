import { fr } from 'date-fns/locale';
import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { EnhancedDate } from '../../src/classes/enhanced-date';

const baseDate = new Date(2024, 1, 14, 13, 45, 30, 123);

describe('class EnhancedDate', () => {
    describe('mutable and to-prefixed operations', () => {
        // Every method only forwards to date-fns, so a representative set covers the mutate versus copy contract.
        it.for([
            {
                args: [3],
                expected: new Date(2024, 1, 17, 13, 45, 30, 123),
                from: baseDate,
                method: 'addDays',
            },
            {
                args: [2],
                expected: new Date(2024, 1, 14, 15, 45, 30, 123),
                from: baseDate,
                method: 'addHours',
            },
            {
                args: [1],
                expected: new Date(2024, 1, 29, 12),
                from: new Date(2024, 0, 31, 12),
                method: 'addMonths',
            },
            {
                args: [1],
                expected: new Date(2024, 1, 7, 13, 45, 30, 123),
                from: baseDate,
                method: 'subWeeks',
            },
            {
                args: [1],
                expected: new Date(2023, 1, 28, 12),
                from: new Date(2024, 1, 29, 12),
                method: 'subYears',
            },
            {
                args: [],
                expected: new Date(2024, 1, 14, 23, 59, 59, 999),
                from: baseDate,
                method: 'endOfDay',
            },
            {
                args: [],
                expected: new Date(2024, 1, 29, 23, 59, 59, 999),
                from: baseDate,
                method: 'endOfMonth',
            },
            {
                args: [],
                expected: new Date(2024, 1, 11),
                from: baseDate,
                method: 'startOfWeek',
            },
        ] as const)(
            'should mutate and return this in $method but return a new date from its to-prefixed counterpart',
            (
                {
                    args,
                    expected,
                    from,
                    method,
                },
                { expect },
            ) => {
                type Operation = (...values: readonly unknown[]) => EnhancedDate;

                const date = new EnhancedDate(from);
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

        it.for([
            {
                input: new Date(2026, 2, 7, 12),
                name: 'spring-forward transition',
                next: new Date(2026, 2, 8, 12),
            },
            {
                input: new Date(2026, 9, 31, 12),
                name: 'fall-back transition',
                next: new Date(2026, 10, 1, 12),
            },
        ])(
            'should add calendar days but elapsed hours across the $name',
            ({ input, next }, { expect, skip }) => {
                skip(input.getTimezoneOffset() === next.getTimezoneOffset(), 'The time zone has no transition on these dates');

                const date = new EnhancedDate(input);

                expect(date.toAddDays(1).getTime()).toBe(next.getTime());
                expect(date.toAddHours(24).getTime()).toBe(input.getTime() + 86_400_000);
            },
        );

        it('should forward week and context options to boundary results', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 7, 12, 34, 56, 789);
            const evening = new EnhancedDate(2026, 0, 15, 20);
            const halfDay = 12 * 3_600_000;
            const shiftByHalfDay = (value: Date | number | string) => new Date(new Date(value).getTime() + halfDay);

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
        it('should convert Unix seconds to and from millisecond timestamps', ({ expect }) => {
            const date = EnhancedDate.fromUnixSeconds(1700000000.5);

            expect(date).toBeInstanceOf(EnhancedDate);
            expect(date.getTime()).toBe(1700000000500);
            expect(date.getUnixTime()).toBe(1700000000);
        });

        it('should parse with the reference date and forward parse options', ({ expect }) => {
            const iso = EnhancedDate.fromISO('2024-02-29');
            const formatted = EnhancedDate.fromFormat('28 février', 'dd MMMM', new Date(2026, 0, 1), { locale: fr });

            expect(iso).toBeInstanceOf(EnhancedDate);
            expect(iso.getTime()).toBe(new Date(2024, 1, 29).getTime());
            expect(formatted).toBeInstanceOf(EnhancedDate);
            expect(formatted.getTime()).toBe(new Date(2026, 1, 28).getTime());
        });

        it('should apply the default pattern and forward explicit patterns and options', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 15, 12, 34, 56);

            expect(date.format()).toBe('2026-01-15 12:34:56');
            expect(date.format('yyyy/MM/dd')).toBe('2026/01/15');
            expect(date.format('MMMM', { locale: fr })).toBe('janvier');
        });

        it('should keep invalid dates invalid through copies and arithmetic', ({ expect }) => {
            const date = EnhancedDate.fromISO('not-a-date');

            expect(date.isValid()).toBe(false);
            expect(date.clone().isValid()).toBe(false);
            expect(Number.isNaN(date.toDate().getTime())).toBe(true);
            expect(date.toAddDays(1).isValid()).toBe(false);
        });
    });

    describe('static extremes', () => {
        it('should return the latest and earliest of mixed Date and timestamp inputs', ({ expect }) => {
            const early = new Date(2024, 0, 1, 8);
            const late = new Date(2025, 11, 31, 23);
            const inputs = [
                new Date(2024, 5, 15, 12),
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
        it('should compare this date against the other date', ({ expect }) => {
            const earlier = new EnhancedDate(2026, 0, 15, 12);
            const later = earlier.toAddMinutes(1);

            expect(later.isAfter(earlier)).toBe(true);
            expect(earlier.isAfter(later)).toBe(false);
            expect(earlier.isBefore(later)).toBe(true);
            expect(later.isBefore(earlier)).toBe(false);
            expect(earlier.isEqual(new Date(earlier))).toBe(true);
            expect(later.isSameDay(earlier)).toBe(true);
            expect(later.isSameMinute(earlier)).toBe(false);
        });

        it('should return this date minus the other date from difference methods', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 10, 23, 59);
            const later = date.toAddSeconds(90);

            expect(date.differenceInMinutes(later)).toBe(-1);
            expect(later.differenceInMinutes(date)).toBe(1);
            expect(later.differenceInSeconds(date)).toBe(90);
            expect(date.differenceInSeconds(later)).toBe(-90);
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

        it.for([
            {
                end: new Date(2026, 0, 15, 23, 59, 59, 999),
                method: 'Today',
                start: new Date(2026, 0, 15),
            },
            {
                end: new Date(2026, 0, 16, 23, 59, 59, 999),
                method: 'Tomorrow',
                start: new Date(2026, 0, 16),
            },
            {
                end: new Date(2026, 0, 14, 23, 59, 59, 999),
                method: 'Yesterday',
                start: new Date(2026, 0, 14),
            },
        ] as const)(
            'should derive the $method boundaries from the current clock',
            (
                {
                    end,
                    method,
                    start,
                },
                { expect },
            ) => {
                vi.useFakeTimers();
                vi.setSystemTime(new Date(2026, 0, 15, 12));

                const startDate = EnhancedDate[`startOf${method}`]();
                const endDate = EnhancedDate[`endOf${method}`]();

                expect(startDate).toBeInstanceOf(EnhancedDate);
                expect(endDate).toBeInstanceOf(EnhancedDate);
                expect(startDate.getTime()).toBe(start.getTime());
                expect(endDate.getTime()).toBe(end.getTime());
            },
        );

        it('should evaluate relative predicates against the current clock', ({ expect }) => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(2026, 0, 15, 12));

            const today = new EnhancedDate(2026, 0, 15, 8);
            const tomorrow = today.toAddDays(1);

            expect(today.isToday()).toBe(true);
            expect(today.isFuture()).toBe(false);
            expect(tomorrow.isToday()).toBe(false);
            expect(tomorrow.isTomorrow()).toBe(true);
            expect(tomorrow.isFuture()).toBe(true);
        });
    });
});
