import * as dateFns from 'date-fns';

import { EnhancedDate } from './classes/enhanced-date';

export type DateRangeType = 'lastMonth' | 'lastWeek' | 'thisMonth' | 'thisWeek' | 'today' | 'yesterday';

/** Formats in the system time zone unless configured through date-fns options. */
export function formatDate(
    date: dateFns.DateArg<Date>,
    format: string = 'yyyy-MM-dd HH:mm:ss',
    options?: dateFns.FormatOptions,
) {
    return dateFns.format(date, format, options);
}

/** Only `null` and `undefined` render as an empty string; an invalid date still throws. */
export function formatOptionalDate(
    date: dateFns.DateArg<Date> | null | undefined,
    format?: string,
    options?: dateFns.FormatOptions,
) {
    return date === null || date === undefined ? '' : formatDate(date, format, options);
}

/**
 * Ranges are calendar ranges in the system time zone, following local daylight saving transitions rather than fixed
 * 24-hour durations. The reference date is unchanged. Boundaries are inclusive, ending at `23:59:59.999` of the
 * range's last day, unless `options.setEndDateToNextDayStart` is `true`, which makes the end the exclusive start of the
 * following day. `options.weekStartsOn` defaults to `1` (Monday).
 *
 * @throws TypeError if the range type is unsupported at runtime.
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
            nextStartDate = startDate.toAddMonths(1).startOfMonth();
            break;
        case 'lastWeek':
            startDate = referenceDate.subWeeks(1).startOfWeek(weekOptions);
            nextStartDate = startDate.toAddWeeks(1).startOfWeek(weekOptions);
            break;
        case 'thisMonth':
            startDate = referenceDate.startOfMonth();
            nextStartDate = startDate.toAddMonths(1).startOfMonth();
            break;
        case 'thisWeek':
            startDate = referenceDate.startOfWeek(weekOptions);
            nextStartDate = startDate.toAddWeeks(1).startOfWeek(weekOptions);
            break;
        case 'today':
            startDate = referenceDate.startOfDay();
            nextStartDate = startDate.toAddDays(1).startOfDay();
            break;
        case 'yesterday':
            startDate = referenceDate.subDays(1).startOfDay();
            nextStartDate = startDate.toAddDays(1).startOfDay();
            break;
        default: throw new TypeError(`Unsupported date range type: ${type}`);
    }

    // Deriving the inclusive end from the next period's start keeps a repeated daylight-saving hour at the end of
    // the range, which a local `23:59:59.999` would resolve to its first occurrence.
    return {
        endDate: options?.setEndDateToNextDayStart ? nextStartDate : nextStartDate.subMilliseconds(1),
        startDate,
    };
}

/** Offsets by calendar days and returns the start of that day in the system time zone. */
export function getStartOfDayFromToday(offsetDays: number = 0) {
    return new EnhancedDate().addDays(offsetDays).startOfDay();
}
