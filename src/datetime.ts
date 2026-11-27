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

/**
 * Returns new start and end dates for a calendar range in the system time zone.
 *
 * @remarks
 * The reference date is unchanged. Boundaries are inclusive by default, ending at `23:59:59.999`.
 * When `options.setEndDateToNextDayStart` is `true`, the end is the exclusive start of the next calendar day.
 * `options.weekStartsOn` defaults to `1` (Monday); `0` means Sunday and `6` means Saturday.
 * Calendar ranges follow local daylight saving transitions rather than fixed 24-hour durations.
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
    const weekOptions = { weekStartsOn: options?.weekStartsOn ?? 1 };
    let nextStartDate: EnhancedDate;
    let startDate: EnhancedDate;
    switch (type) {
        case 'lastMonth':
            startDate = referenceDate.subMonths(1).startOfMonth();
            nextStartDate = startDate.toAddMonths(1);
            break;
        case 'lastWeek':
            startDate = referenceDate.subWeeks(1).startOfWeek(weekOptions);
            nextStartDate = startDate.toAddWeeks(1);
            break;
        case 'thisMonth':
            startDate = referenceDate.startOfMonth();
            nextStartDate = startDate.toAddMonths(1);
            break;
        case 'thisWeek':
            startDate = referenceDate.startOfWeek(weekOptions);
            nextStartDate = startDate.toAddWeeks(1);
            break;
        case 'today':
            startDate = referenceDate.startOfDay();
            nextStartDate = startDate.toAddDays(1);
            break;
        case 'yesterday':
            startDate = referenceDate.subDays(1).startOfDay();
            nextStartDate = startDate.toAddDays(1);
            break;
        default: throw new Error(`Unsupported date range type: ${type}`);
    }

    // Deriving the inclusive end from the next period's start keeps a repeated daylight-saving hour at the end of
    // the range, which a local `23:59:59.999` would resolve to its first occurrence.
    return {
        endDate: options?.setEndDateToNextDayStart ? nextStartDate : nextStartDate.subMilliseconds(1),
        startDate,
    };
}

/**
 * Returns a new date at the start of the local day, offset by `offsetDays` calendar days from today.
 */
export function getStartOfDayFromToday(offsetDays: number = 0) {
    return new EnhancedDate().addDays(offsetDays).startOfDay();
}
