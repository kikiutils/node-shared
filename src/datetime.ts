import * as dateFns from 'date-fns';

import { EnhancedDate } from './classes/enhanced-date';

export type DateRangeType = 'lastMonth' | 'lastWeek' | 'thisMonth' | 'thisWeek' | 'today' | 'yesterday';

/**
 * Formats a date using a date-fns pattern without changing the input.
 *
 * @remarks
 * Formatting uses the system time zone unless configured through date-fns options.
 * Invalid dates and unsupported patterns propagate date-fns exceptions.
 *
 * @param date - The date, timestamp in milliseconds, or date string to format.
 * @param format - The date-fns pattern. Defaults to `yyyy-MM-dd HH:mm:ss`.
 * @param options - Formatting options passed to date-fns.
 *
 * @returns The formatted date string.
 *
 * @example
 *
 * ```ts
 * import { formatDate } from '@kikiutils/shared/datetime';
 *
 * const date = new Date(2026, 0, 15, 12);
 * console.log(formatDate(date, 'yyyy-MM-dd')); // => '2026-01-15'
 * ```
 */
export function formatDate(
    date: dateFns.DateArg<Date>,
    format: string = 'yyyy-MM-dd HH:mm:ss',
    options?: dateFns.FormatOptions,
) {
    return dateFns.format(date, format, options);
}

/* eslint-disable jsdoc/check-param-names -- Inline TypeScript options are documented in remarks. */

/**
 * Returns new start and end dates for a calendar range in the system time zone.
 *
 * @remarks
 * The reference date is unchanged. Boundaries are inclusive by default, ending at `23:59:59.999`.
 * When `options.setEndDateToNextDayStart` is `true`, the end is the exclusive start of the next calendar day.
 * `options.weekStartsOn` defaults to `1` (Monday); `0` means Sunday and `6` means Saturday.
 * Calendar ranges follow local daylight saving transitions rather than fixed 24-hour durations.
 *
 * @param date - The reference date for the range.
 * @param type - The current or previous day, week, or month to select.
 * @param options - Settings for the end boundary and first day of the week.
 *
 * @returns An object containing new `EnhancedDate` boundaries; the reference date is unchanged.
 *
 * @throws Error if the range type is unsupported at runtime.
 *
 * @example
 *
 * ```ts
 * import { getDateRangeFromDate } from '@kikiutils/shared/datetime';
 *
 * const range = getDateRangeFromDate(new Date(2026, 6, 15, 12), 'lastMonth');
 * console.log(range.startDate.format('yyyy-MM-dd')); // => '2026-06-01'
 * console.log(range.endDate.format('yyyy-MM-dd')); // => '2026-06-30'
 * ```
 */
export function getDateRangeFromDate(
    date: Date,
    type: DateRangeType,
    options?: {
        setEndDateToNextDayStart?: boolean;
        weekStartsOn?: dateFns.Day;
    },
) {
    const referenceDate = new EnhancedDate(date);
    let endDate: EnhancedDate;
    let startDate: EnhancedDate;
    switch (type) {
        case 'lastMonth':
            {
                const lastMonth = referenceDate.toSubMonths(1);
                endDate = lastMonth.toEndOfMonth();
                startDate = lastMonth.toStartOfMonth();
            }

            break;
        case 'lastWeek':
            {
                const lastWeek = referenceDate.toSubWeeks(1);
                endDate = lastWeek.toEndOfWeek({ weekStartsOn: options?.weekStartsOn ?? 1 });
                startDate = lastWeek.toStartOfWeek({ weekStartsOn: options?.weekStartsOn ?? 1 });
            }

            break;
        case 'thisMonth':
            endDate = referenceDate.toEndOfMonth();
            startDate = referenceDate.toStartOfMonth();
            break;
        case 'thisWeek':
            endDate = referenceDate.toEndOfWeek({ weekStartsOn: options?.weekStartsOn ?? 1 });
            startDate = referenceDate.toStartOfWeek({ weekStartsOn: options?.weekStartsOn ?? 1 });
            break;
        case 'today':
            endDate = referenceDate.toEndOfDay();
            startDate = referenceDate.toStartOfDay();
            break;
        case 'yesterday':
            {
                const yesterday = referenceDate.toSubDays(1);
                endDate = yesterday.toEndOfDay();
                startDate = yesterday.toStartOfDay();
            }

            break;
        default: throw new Error(`Unsupported date range type: ${type}`);
    }

    if (options?.setEndDateToNextDayStart) endDate.setHours(24, 0, 0, 0);
    return {
        endDate,
        startDate,
    };
}

/* eslint-enable jsdoc/check-param-names */

/**
 * Returns a new date at local midnight with an optional calendar-day offset from today.
 *
 * @param offsetDays - The calendar days to add; negative values select earlier days.
 *
 * @returns A new `EnhancedDate` at local midnight on the selected day.
 */
export function getMidnightDateFromToday(offsetDays: number = 0) {
    return new EnhancedDate().addDays(offsetDays).startOfDay();
}
