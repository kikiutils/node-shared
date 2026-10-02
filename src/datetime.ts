import * as dateFns from 'date-fns';

import { EnhancedDate } from './classes/enhanced-date';

export type DateRangeType = 'lastMonth' | 'lastWeek' | 'thisMonth' | 'thisWeek' | 'today' | 'yesterday';

/**
 * Formats a given date, timestamp, or date string into a specified format.
 *
 * This function is a wrapper around `date-fns/format`.
 *
 * @param {DateArg<Date>} date - The input date to format. Can be a Date object, a timestamp, or a string
 * @param {string} [format] - The target format string
 * @param {FormatOptions} [options] - Optional formatting options passed to `date-fns/format`
 *
 * @returns {string} The formatted date string
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
 */
export function formatDate(
    date: dateFns.DateArg<Date>,
    format: string = 'yyyy-MM-dd HH:mm:ss',
    options?: dateFns.FormatOptions,
) {
    return dateFns.format(date, format, options);
}

/**
 * Get the date range (start and end) based on a given date and range type.
 *
 * Supports common range types like 'lastMonth', 'lastWeek', 'thisMonth', 'thisWeek', 'today', and 'yesterday'.
 *
 * @param {Date} date - The reference date
 * @param {DateRangeType} type - The range type to compute
 * @param {object} [options] - Optional settings
 * @param {boolean} [options.setEndDateToNextDayStart] - If true, set `endDate` to 00:00:00.000 of the next day
 * @param {Day} [options.weekStartsOn] - The start day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 *
 * @returns {{ startDate: EnhancedDate, endDate: EnhancedDate }} An object with `startDate` and `endDate`
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

/**
 * Returns an `EnhancedDate` set to midnight (00:00:00) of today, with an optional day offset.
 *
 * @param {number} [offsetDays] - Number of days to offset from today. Can be negative
 *
 * @returns {EnhancedDate} An `EnhancedDate` at 00:00:00 of the offset day
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
    return new EnhancedDate().addDays(offsetDays).startOfDay();
}
