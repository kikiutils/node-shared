import { format as dateFnsFormat } from 'date-fns';
import type { FormatOptions } from 'date-fns';

/**
 * Formats a given date, timestamp, or string into the specified format.
 *
 * @param {Date | number | string} dateOrTimestamp - The date or timestamp to be formatted. Can be a Date object, a numeric timestamp, or a date string.
 * @param {string} [format='yyyy-MM-dd HH:mm:ss'] - The desired date format. Defaults to 'yyyy-MM-dd HH:mm:ss'.
 * @param {FormatOptions} [options] - Optional configuration for formatting.
 * @returns {string} The formatted date string.
 *
 * @example
 * ```typescript
 * import { formatDateOrTimestamp } from '@kikiutils/node/datetime';
 *
 * // Format a Date object
 * const formattedDate = formatDateOrTimestamp(new Date(), 'yyyy-MM-dd');
 * console.log(formattedDate); // Output: '2024-07-10'
 *
 * // Format a numeric timestamp
 * const formattedTimestamp = formatDateOrTimestamp(1657814400000, 'yyyy-MM-dd');
 * console.log(formattedTimestamp); // Output: '2022-07-15'
 *
 * // Format a date string
 * const formattedString = formatDateOrTimestamp('2024-07-10T00:00:00Z', 'yyyy-MM-dd');
 * console.log(formattedString); // Output: '2024-07-10'
 * ```
 */
export const formatDateOrTimestamp = (dateOrTimestamp: Date | number | string, format: string = 'yyyy-MM-dd HH:mm:ss', options?: FormatOptions) => dateFnsFormat(dateOrTimestamp, format, options);

/**
 * Returns a Date object set to midnight (00:00:00) of today or with an offset of the specified number of days.
 *
 * @param {number} [offsetDays=0] - The number of days to offset from today. Defaults to 0.
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
export const getMidnightDateFromToday = (offsetDays: number = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offsetDays);
	date.setHours(0, 0, 0, 0);
	return date;
};
