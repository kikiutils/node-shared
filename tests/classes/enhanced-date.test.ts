import * as dateFns from 'date-fns';
import { enUS } from 'date-fns/locale';
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
            expect(new EnhancedDate(original.getTime()).getTime()).toBe(original.getTime());
            expect(new EnhancedDate(2026, 0, 15, 12, 34, 56, 789).getTime()).toBe(original.getTime());
            expect(new EnhancedDate(original.toISOString()).getTime()).toBe(original.getTime());

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

        it('should preserve native setter returns, coercion, and JSON serialization', ({ expect }) => {
            const date = new EnhancedDate(0);

            expect(date.setTime(1234)).toBe(1234);
            expect(+date).toBe(1234);
            expect(JSON.stringify(date)).toBe('"1970-01-01T00:00:01.234Z"');
        });
    });

    describe('mutable and immutable operations', () => {
        it.for([
            [
                'addDays',
                'toAddDays',
                new Date(2026, 0, 16, 12, 34, 56, 789),
            ],
            [
                'addMilliseconds',
                'toAddMilliseconds',
                new Date(2026, 0, 15, 12, 34, 56, 790),
            ],
            [
                'subMinutes',
                'toSubMinutes',
                new Date(2026, 0, 15, 12, 33, 56, 789),
            ],
            [
                'subWeeks',
                'toSubWeeks',
                new Date(2026, 0, 8, 12, 34, 56, 789),
            ],
        ] as const)(
            'should keep identity and nonmutation contracts for %s',
            (
                [
                    mutable,
                    immutable,
                    expected,
                ],
                { expect },
            ) => {
                const date = new EnhancedDate(2026, 0, 15, 12, 34, 56, 789);
                const originalTime = date.getTime();
                const result = date[immutable](1);

                expect(result).toBeInstanceOf(EnhancedDate);
                expect(result).not.toBe(date);
                expect(result.getTime()).toBe(expected.getTime());
                expect(date.getTime()).toBe(originalTime);
                expect(date[mutable](1)).toBe(date);
                expect(date.getTime()).toBe(result.getTime());
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

        it('should keep calendar-day additions distinct from elapsed hours across offset changes', ({ expect }) => {
            const date = new EnhancedDate(2026, 2, 7, 12);
            const nextDay = date.toAddDays(1);
            const elapsedDay = date.toAddHours(24);
            const offsetChangeMs = (nextDay.getTimezoneOffset() - date.getTimezoneOffset()) * 60_000;

            expect(nextDay.getTime()).toBe(new Date(2026, 2, 8, 12).getTime());
            expect(nextDay.getTime() - date.getTime()).toBe(86_400_000 + offsetChangeMs);
            expect(elapsedDay.getTime() - date.getTime()).toBe(86_400_000);
        });

        it('should forward week options and return independent boundary dates', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 7, 12, 34, 56, 789);
            const originalTime = date.getTime();

            expect(date.toStartOfWeek({ weekStartsOn: 1 }).getTime()).toBe(new Date(2026, 0, 5).getTime());
            expect(date.toEndOfWeek({ weekStartsOn: 1 }).getTime())
                .toBe(new Date(2026, 0, 11, 23, 59, 59, 999).getTime());

            expect(date.toStartOfWeek({ weekStartsOn: 0 }).getTime()).toBe(new Date(2026, 0, 4).getTime());
            expect(date.getTime()).toBe(originalTime);
            expect(date.startOfDay().endOfMinute()).toBe(date);
            expect(date.getTime()).toBe(new Date(2026, 0, 7, 0, 0, 59, 999).getTime());
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

        it('should support the default pattern and forward explicit patterns and locale options', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 15, 12, 34, 56);

            expect(date.format()).toBe('2026-01-15 12:34:56');
            expect(date.format('yyyy/MM/dd')).toBe('2026/01/15');
            expect(date.format('MMMM', { locale: enUS })).toBe('January');
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

        it('should retain difference direction and forward rounding and week-start options', ({ expect }) => {
            const date = new EnhancedDate(2026, 0, 10, 23, 59);
            const later = date.toAddSeconds(90);

            expect(date.differenceInMinutes(later)).toBe(-1);
            expect(date.differenceInMinutes(later, { roundingMethod: 'floor' })).toBe(-2);
            expect(later.differenceInMinutes(date)).toBe(1);
            expect(later.differenceInCalendarDays(date)).toBe(1);
            expect(date.differenceInCalendarDays(later)).toBe(-1);
            expect(later.differenceInCalendarWeeks(date, { weekStartsOn: 0 })).toBe(1);
            expect(later.differenceInCalendarWeeks(date, { weekStartsOn: 1 })).toBe(0);
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
