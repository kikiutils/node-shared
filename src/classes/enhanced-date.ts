import * as dateFns from 'date-fns';

/**
 * A mutable `Date` with chainable date-fns operations.
 *
 * @remarks
 * Inherits the native constructor, including zero-based month arguments and millisecond timestamps. Mutating
 * arithmetic and boundary methods update this instance and return `this`; their `to`-prefixed counterparts return a
 * new `EnhancedDate`. Invalid dates, parsing, rounding, week defaults, and time zones follow date-fns semantics, so
 * operations use the system time zone unless configured through options and can preserve or produce `Invalid Date`.
 * Day and week arithmetic uses calendar days, preserving local wall-clock time across daylight saving changes; hour
 * through millisecond arithmetic uses elapsed durations. Month and year arithmetic clamps to the last valid day of
 * the destination month, while native setters keep their overflow behavior. `differenceIn*` methods return this
 * date minus the other date.
 *
 * In Vue state, replace the value with a `to`-prefixed result: mutating a Date's internal timestamp does not trigger
 * reactive updates.
 */
export class EnhancedDate extends Date {
    static endOfToday(options?: dateFns.EndOfTodayOptions) {
        return new EnhancedDate(dateFns.endOfToday(options));
    }

    static endOfTomorrow(options?: dateFns.EndOfTomorrowOptions) {
        return new EnhancedDate(dateFns.endOfTomorrow(options));
    }

    static endOfYesterday(options?: dateFns.EndOfYesterdayOptions) {
        return new EnhancedDate(dateFns.endOfYesterday(options));
    }

    /** Parses a date with a date-fns pattern; `referenceDate` supplies the fields the pattern does not contain. */
    static fromFormat(
        value: string,
        pattern: string,
        referenceDate: dateFns.DateArg<Date>,
        options?: dateFns.ParseOptions,
    ) {
        return new EnhancedDate(dateFns.parse(value, pattern, referenceDate, options));
    }

    /** Parses an ISO 8601 string, including partial dates such as `2026-01`. */
    static fromISO(value: string, options?: dateFns.ParseISOOptions) {
        return new EnhancedDate(dateFns.parseISO(value, options));
    }

    static fromUnixSeconds(seconds: number) {
        return new EnhancedDate(seconds * 1000);
    }

    /** Returns the latest date, or `Invalid Date` if the array is empty or contains an invalid date. */
    static max(dates: Array<Date | number>, options?: dateFns.MaxOptions) {
        return new EnhancedDate(dateFns.max(dates, options));
    }

    /** Returns the earliest date, or `Invalid Date` if the array is empty or contains an invalid date. */
    static min(dates: Array<Date | number>, options?: dateFns.MinOptions) {
        return new EnhancedDate(dateFns.min(dates, options));
    }

    static startOfToday(options?: dateFns.StartOfTodayOptions) {
        return new EnhancedDate(dateFns.startOfToday(options));
    }

    static startOfTomorrow(options?: dateFns.StartOfTomorrowOptions) {
        return new EnhancedDate(dateFns.startOfTomorrow(options));
    }

    static startOfYesterday(options?: dateFns.StartOfYesterdayOptions) {
        return new EnhancedDate(dateFns.startOfYesterday(options));
    }

    #set(date: Date) {
        this.setTime(date.getTime());
        return this;
    }

    addDays(amount: number, options?: dateFns.AddDaysOptions) {
        return this.#set(dateFns.addDays(this, amount, options));
    }

    addHours(amount: number, options?: dateFns.AddHoursOptions) {
        return this.#set(dateFns.addHours(this, amount, options));
    }

    addMilliseconds(amount: number, options?: dateFns.AddMillisecondsOptions) {
        return this.#set(dateFns.addMilliseconds(this, amount, options));
    }

    addMinutes(amount: number, options?: dateFns.AddMinutesOptions) {
        return this.#set(dateFns.addMinutes(this, amount, options));
    }

    addMonths(amount: number, options?: dateFns.AddMonthsOptions) {
        return this.#set(dateFns.addMonths(this, amount, options));
    }

    addSeconds(amount: number, options?: dateFns.AddSecondsOptions) {
        return this.#set(dateFns.addSeconds(this, amount, options));
    }

    addWeeks(amount: number, options?: dateFns.AddWeeksOptions) {
        return this.#set(dateFns.addWeeks(this, amount, options));
    }

    addYears(amount: number, options?: dateFns.AddYearsOptions) {
        return this.#set(dateFns.addYears(this, amount, options));
    }

    clone() {
        return new EnhancedDate(this.getTime());
    }

    differenceInCalendarDays(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInCalendarDaysOptions) {
        return dateFns.differenceInCalendarDays(this, other, options);
    }

    differenceInCalendarWeeks(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInCalendarWeeksOptions) {
        return dateFns.differenceInCalendarWeeks(this, other, options);
    }

    /** Counts full minutes, truncating by default. */
    differenceInMinutes(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInMinutesOptions) {
        return dateFns.differenceInMinutes(this, other, options);
    }

    /** Counts full seconds, truncating by default. */
    differenceInSeconds(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInSecondsOptions) {
        return dateFns.differenceInSeconds(this, other, options);
    }

    endOfDay(options?: dateFns.EndOfDayOptions) {
        return this.#set(dateFns.endOfDay(this, options));
    }

    endOfMinute(options?: dateFns.EndOfMinuteOptions) {
        return this.#set(dateFns.endOfMinute(this, options));
    }

    endOfMonth(options?: dateFns.EndOfMonthOptions) {
        return this.#set(dateFns.endOfMonth(this, options));
    }

    endOfWeek(options?: dateFns.EndOfWeekOptions) {
        return this.#set(dateFns.endOfWeek(this, options));
    }

    format(pattern: string = 'yyyy-MM-dd HH:mm:ss', options?: dateFns.FormatOptions) {
        return dateFns.format(this, pattern, options);
    }

    formatDistanceToNow(options?: dateFns.FormatDistanceToNowOptions) {
        return dateFns.formatDistanceToNow(this, options);
    }

    /** Unix seconds, unlike the millisecond `getTime()`. */
    getUnixTime() {
        return dateFns.getUnixTime(this);
    }

    isAfter(other: dateFns.DateArg<Date>) {
        return dateFns.isAfter(this, other);
    }

    isBefore(other: dateFns.DateArg<Date>) {
        return dateFns.isBefore(this, other);
    }

    isEqual(other: dateFns.DateArg<Date>) {
        return dateFns.isEqual(this, other);
    }

    isFuture() {
        return dateFns.isFuture(this);
    }

    isSameDay(other: dateFns.DateArg<Date>, options?: dateFns.IsSameDayOptions) {
        return dateFns.isSameDay(this, other, options);
    }

    isSameMinute(other: dateFns.DateArg<Date>) {
        return dateFns.isSameMinute(this, other);
    }

    isToday(options?: dateFns.IsTodayOptions) {
        return dateFns.isToday(this, options);
    }

    isTomorrow(options?: dateFns.IsTomorrowOptions) {
        return dateFns.isTomorrow(this, options);
    }

    isValid() {
        return dateFns.isValid(this);
    }

    startOfDay(options?: dateFns.StartOfDayOptions) {
        return this.#set(dateFns.startOfDay(this, options));
    }

    startOfMinute(options?: dateFns.StartOfMinuteOptions) {
        return this.#set(dateFns.startOfMinute(this, options));
    }

    startOfMonth(options?: dateFns.StartOfMonthOptions<Date>) {
        return this.#set(dateFns.startOfMonth(this, options));
    }

    startOfWeek(options?: dateFns.StartOfWeekOptions) {
        return this.#set(dateFns.startOfWeek(this, options));
    }

    subDays(amount: number, options?: dateFns.SubDaysOptions) {
        return this.#set(dateFns.subDays(this, amount, options));
    }

    subHours(amount: number, options?: dateFns.SubHoursOptions) {
        return this.#set(dateFns.subHours(this, amount, options));
    }

    subMilliseconds(amount: number, options?: dateFns.SubMillisecondsOptions) {
        return this.#set(dateFns.subMilliseconds(this, amount, options));
    }

    subMinutes(amount: number, options?: dateFns.SubMinutesOptions) {
        return this.#set(dateFns.subMinutes(this, amount, options));
    }

    subMonths(amount: number, options?: dateFns.SubMonthsOptions) {
        return this.#set(dateFns.subMonths(this, amount, options));
    }

    subSeconds(amount: number, options?: dateFns.SubSecondsOptions) {
        return this.#set(dateFns.subSeconds(this, amount, options));
    }

    subWeeks(amount: number, options?: dateFns.SubWeeksOptions) {
        return this.#set(dateFns.subWeeks(this, amount, options));
    }

    subYears(amount: number, options?: dateFns.SubYearsOptions) {
        return this.#set(dateFns.subYears(this, amount, options));
    }

    toAddDays(amount: number, options?: dateFns.AddDaysOptions) {
        return this.clone().addDays(amount, options);
    }

    toAddHours(amount: number, options?: dateFns.AddHoursOptions) {
        return this.clone().addHours(amount, options);
    }

    toAddMilliseconds(amount: number, options?: dateFns.AddMillisecondsOptions) {
        return this.clone().addMilliseconds(amount, options);
    }

    toAddMinutes(amount: number, options?: dateFns.AddMinutesOptions) {
        return this.clone().addMinutes(amount, options);
    }

    toAddMonths(amount: number, options?: dateFns.AddMonthsOptions) {
        return this.clone().addMonths(amount, options);
    }

    toAddSeconds(amount: number, options?: dateFns.AddSecondsOptions) {
        return this.clone().addSeconds(amount, options);
    }

    toAddWeeks(amount: number, options?: dateFns.AddWeeksOptions) {
        return this.clone().addWeeks(amount, options);
    }

    toAddYears(amount: number, options?: dateFns.AddYearsOptions) {
        return this.clone().addYears(amount, options);
    }

    /** Returns a plain native `Date` with the same timestamp. */
    toDate() {
        return new Date(this.getTime());
    }

    toEndOfDay(options?: dateFns.EndOfDayOptions) {
        return this.clone().endOfDay(options);
    }

    toEndOfMinute(options?: dateFns.EndOfMinuteOptions) {
        return this.clone().endOfMinute(options);
    }

    toEndOfMonth(options?: dateFns.EndOfMonthOptions) {
        return this.clone().endOfMonth(options);
    }

    toEndOfWeek(options?: dateFns.EndOfWeekOptions) {
        return this.clone().endOfWeek(options);
    }

    toStartOfDay(options?: dateFns.StartOfDayOptions) {
        return this.clone().startOfDay(options);
    }

    toStartOfMinute(options?: dateFns.StartOfMinuteOptions) {
        return this.clone().startOfMinute(options);
    }

    toStartOfMonth(options?: dateFns.StartOfMonthOptions<Date>) {
        return this.clone().startOfMonth(options);
    }

    toStartOfWeek(options?: dateFns.StartOfWeekOptions) {
        return this.clone().startOfWeek(options);
    }

    toSubDays(amount: number, options?: dateFns.SubDaysOptions) {
        return this.clone().subDays(amount, options);
    }

    toSubHours(amount: number, options?: dateFns.SubHoursOptions) {
        return this.clone().subHours(amount, options);
    }

    toSubMilliseconds(amount: number, options?: dateFns.SubMillisecondsOptions) {
        return this.clone().subMilliseconds(amount, options);
    }

    toSubMinutes(amount: number, options?: dateFns.SubMinutesOptions) {
        return this.clone().subMinutes(amount, options);
    }

    toSubMonths(amount: number, options?: dateFns.SubMonthsOptions) {
        return this.clone().subMonths(amount, options);
    }

    toSubSeconds(amount: number, options?: dateFns.SubSecondsOptions) {
        return this.clone().subSeconds(amount, options);
    }

    toSubWeeks(amount: number, options?: dateFns.SubWeeksOptions) {
        return this.clone().subWeeks(amount, options);
    }

    toSubYears(amount: number, options?: dateFns.SubYearsOptions) {
        return this.clone().subYears(amount, options);
    }
}
