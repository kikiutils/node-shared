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

/** An invalid date still throws, as date-fns `format` does. */
export function formatOptionalDate(
    date: dateFns.DateArg<Date> | null | undefined,
    format?: string,
    options?: dateFns.FormatOptions,
) {
    return date === null || date === undefined ? '' : formatDate(date, format, options);
}

/** Calendar ranges in the system time zone, so days across daylight saving changes are not 24 hours long. */
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

export function getStartOfDayFromToday(offsetDays: number = 0) {
    return new EnhancedDate().addDays(offsetDays).startOfDay();
}
