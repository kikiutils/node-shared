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
 * Formats a given date, timestamp, or string into the specified format.
 *
 * @param {DateArg<Date>} date - The date or timestamp to be formatted. Can be a Date object, a numeric timestamp, or a date string.
 * @param {string} [format] - The desired date format. Defaults to 'yyyy-MM-dd HH:mm:ss'.
 * @param {FormatOptions} [options] - Optional configuration for formatting.
 * @returns {string} The formatted date string.
 *
 * @example
 * ```typescript
 * import { formatDate } from '@kikiutils/node/datetime';
 *
 * // Format a Date object
 * const formattedDate = formatDate(new Date(), 'yyyy-MM-dd');
 * console.log(formattedDate); // Output: '2024-07-10'
 *
 * // Format a numeric timestamp
 * const formattedTimestamp = formatDate(1657814400000, 'yyyy-MM-dd');
 * console.log(formattedTimestamp); // Output: '2022-07-15'
 *
 * // Format a date string
 * const formattedString = formatDate('2024-07-10T00:00:00Z', 'yyyy-MM-dd');
 * console.log(formattedString); // Output: '2024-07-10'
 * ```
 */
export const formatDate = (date: DateArg<Date> & {}, format: string = 'yyyy-MM-dd HH:mm:ss', options?: FormatOptions) => dateFnsFormat(date, format, options);

/**
 * Get the date range (start date and end date) based on the specified date and range type.
 *
 * @param {Date} date - The reference date to calculate the date range.
 * @param {DateRangeType} type - The type of date range to calculate. Valid types are 'lastMonth', 'lastWeek', 'thisMonth', 'thisWeek', 'today', and 'yesterday'.
 * @param {object} [options] - Optional settings.
 * @param {boolean} [options.setEndDateToNextDayStart] - If true, set the end date to the next day at 00:00:00.000.
 * @param {Day} [options.weekStartsOn] - The day the week starts on, with 0 being Sunday and 6 being Saturday. Defaults to 1 (Monday).
 *
 * @returns {object} An object containing the start date and end date.
 *
 * @example
 * ```typescript
 * import { getDateRangeFromDate } from '@kikiutils/node/datetime';
 *
 * // Get the date range for the last month from a given date
 * const date = new Date('2023-07-01');
 * const range = getDateRangeFromDate(date, 'lastMonth');
 * console.log(range);
 * // Output: { startDate: 2023-06-01T00:00:00.000Z, endDate: 2023-06-30T23:59:59.999Z }
 *
 * // Get the date range for this week from a given date, with the week starting on Sunday
 * const date = new Date('2023-07-01');
 * const range = getDateRangeFromDate(date, 'thisWeek', { weekStartsOn: 0 });
 * console.log(range);
 * // Output: { startDate: 2023-06-25T00:00:00.000Z, endDate: 2023-07-01T23:59:59.999Z }
 * ```
 */
export function getDateRangeFromDate(date: Date, type: DateRangeType, options?: { setEndDateToNextDayStart?: boolean; weekStartsOn?: Day }) {
    let endDate: Date;
    let startDate: Date;
    if (type === 'lastMonth') {
        const lastMonth = subMonths(date, 1);
        endDate = endOfMonth(lastMonth);
        startDate = startOfMonth(lastMonth);
    } else if (type === 'lastWeek') {
        const lastWeek = subWeeks(date, 1);
        endDate = endOfWeek(lastWeek, { weekStartsOn: options?.weekStartsOn ?? 1 });
        startDate = startOfWeek(lastWeek, { weekStartsOn: options?.weekStartsOn ?? 1 });
    } else if (type === 'thisMonth') {
        endDate = endOfMonth(date);
        startDate = startOfMonth(date);
    } else if (type === 'thisWeek') {
        endDate = endOfWeek(date, { weekStartsOn: options?.weekStartsOn ?? 1 });
        startDate = startOfWeek(date, { weekStartsOn: options?.weekStartsOn ?? 1 });
    } else if (type === 'today') {
        endDate = endOfDay(date);
        startDate = startOfDay(date);
    } else {
        const yesterday = subDays(date, 1);
        endDate = endOfDay(yesterday);
        startDate = startOfDay(yesterday);
    }

    if (options?.setEndDateToNextDayStart) endDate.setHours(24, 0, 0, 0);
    return {
        endDate,
        startDate,
    };
}

/**
 * Returns a Date object set to midnight (00:00:00) of today or with an offset of the specified number of days.
 *
 * @param {number} [offsetDays] - The number of days to offset from today. Defaults to 0.
 * @returns {Date} The Date object set to midnight of the offset date.
 *
 * @example
 * ```typescript
 * import { getMidnightDateFromToday } from '@kikiutils/node/datetime';
 *
 * // Get today's midnight date
 * const midnightToday = getMidnightDateFromToday();
 * console.log(midnightToday); // Output: Date object representing today's date at 00:00:00
 *
 * // Get midnight date 3 days from today
 * const midnightIn3Days = getMidnightDateFromToday(3);
 * console.log(midnightIn3Days); // Output: Date object representing the date 3 days from today at 00:00:00
 * ```
 */
export function getMidnightDateFromToday(offsetDays: number = 0) {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    date.setHours(0, 0, 0, 0);
    return date;
}
