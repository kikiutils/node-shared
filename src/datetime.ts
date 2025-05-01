import {
    format as dateFnsFormat,
    endOfDay,
    endOfMonth,
    endOfWeek,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import type {
    DateArg,
    Day,
    FormatOptions,
} from 'date-fns';

export type DateRangeType = 'lastMonth' | 'lastWeek' | 'thisMonth' | 'thisWeek' | 'today' | 'yesterday';

/**
 * Formats a given date, timestamp, or date string into a specified format.
 *
 * This function is a wrapper around `date-fns/format`.
 *
 * @param {DateArg<Date>} date - The input date to format. Can be a Date object, a timestamp, or a string.
 * @param {string} [format] - The target format string.
 * @param {FormatOptions} [options] - Optional formatting options passed to `date-fns/format`.
 *
 * @returns {string} The formatted date string.
 *
 * @example
 * ```typescript
 * import { formatDate } from '@kikiutils/shared/datetime';
 *
 * // Format a Date object
 * console.log(formatDate(new Date(), 'yyyy-MM-dd')); // 2024-07-10
 *
 * // Format a timestamp
 * console.log(formatDate(1657814400000, 'yyyy-MM-dd')); // 2022-07-15
 *
 * // Format a date string
 * console.log(formatDate('2024-07-10T00:00:00Z', 'yyyy-MM-dd')); // 2024-07-10
 * ```
 *
 * @see https://date-fns.org/docs/format
 */
export function formatDate(date: DateArg<Date> & {}, format: string = 'yyyy-MM-dd HH:mm:ss', options?: FormatOptions) {
    return dateFnsFormat(date, format, options);
}

/**
 * Get the date range (start and end) based on a given date and range type.
 *
 * Supports common range types like 'lastMonth', 'lastWeek', 'thisMonth', 'thisWeek', 'today', and 'yesterday'.
 *
 * @param {Date} date - The reference date.
 * @param {DateRangeType} type - The range type to compute.
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.setEndDateToNextDayStart] - If true, set `endDate` to 00:00:00.000 of the next day.
 * @param {Day} [options.weekStartsOn] - The start day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 *
 * @returns {{ startDate: Date, endDate: Date }} An object with `startDate` and `endDate`.
 *
 * @example
 * ```typescript
 * import { getDateRangeFromDate } from '@kikiutils/shared/datetime';
 *
 * // Get the date range for last month
 * const date = new Date('2023-07-01');
 * console.log(getDateRangeFromDate(date, 'lastMonth'));
 * // { startDate: 2023-06-01T00:00:00.000Z, endDate: 2023-06-30T23:59:59.999Z }
 *
 * // Get this week's range with Sunday as the first day
 * console.log(getDateRangeFromDate(date, 'thisWeek', { weekStartsOn: 0 }));
 * // { startDate: 2023-06-25T00:00:00.000Z, endDate: 2023-07-01T23:59:59.999Z }
 * ```
 */
export function getDateRangeFromDate(
    date: Date,
    type: DateRangeType,
    options?: {
        setEndDateToNextDayStart?: boolean;
        weekStartsOn?: Day;
    },
) {
    let endDate: Date;
    let startDate: Date;
    switch (type) {
        case 'lastMonth':
            {
                const lastMonth = subMonths(date, 1);
                endDate = endOfMonth(lastMonth);
                startDate = startOfMonth(lastMonth);
            }

            break;
        case 'lastWeek':
            {
                const lastWeek = subWeeks(date, 1);
                endDate = endOfWeek(lastWeek, { weekStartsOn: options?.weekStartsOn ?? 1 });
                startDate = startOfWeek(lastWeek, { weekStartsOn: options?.weekStartsOn ?? 1 });
            }

            break;
        case 'thisMonth':
            endDate = endOfMonth(date);
            startDate = startOfMonth(date);
            break;
        case 'thisWeek':
            endDate = endOfWeek(date, { weekStartsOn: options?.weekStartsOn ?? 1 });
            startDate = startOfWeek(date, { weekStartsOn: options?.weekStartsOn ?? 1 });
            break;
        case 'today':
            endDate = endOfDay(date);
            startDate = startOfDay(date);
            break;
        case 'yesterday':
            {
                const yesterday = subDays(date, 1);
                endDate = endOfDay(yesterday);
                startDate = startOfDay(yesterday);
            }

            break;
        default: throw new Error(`Unsupported date range type: ${type}.`);
    }

    if (options?.setEndDateToNextDayStart) endDate.setHours(24, 0, 0, 0);
    return {
        endDate,
        startDate,
    };
}

/**
 * Returns a `Date` object set to midnight (00:00:00) of today, with an optional day offset.
 *
 * @param {number} [offsetDays] - Number of days to offset from today. Can be negative.
 *
 * @returns {Date} A `Date` object at 00:00:00 of the offset day.
 *
 * @example
 * ```typescript
 * import { getMidnightDateFromToday } from '@kikiutils/shared/datetime';
 *
 * console.log(getMidnightDateFromToday()); // today at 00:00:00
 * console.log(getMidnightDateFromToday(3)); // 3 days from today at 00:00:00
 * console.log(getMidnightDateFromToday(-1)); // yesterday at 00:00:00
 * ```
 */
export function getMidnightDateFromToday(offsetDays: number = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    date.setHours(0, 0, 0, 0);
    return date;
}
