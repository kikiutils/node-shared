import * as dateFns from 'date-fns';

/**
 * A mutable calendar date with chainable date-fns operations.
 *
 * @remarks
 * Inherits the native constructor, including zero-based month arguments and millisecond timestamps.
 * Mutating arithmetic and boundary methods update this instance and return `this`;
 * their `to`-prefixed counterparts return a new `EnhancedDate` instead.
 * Invalid dates, parsing, rounding, and week defaults follow date-fns semantics.
 * Operations use the system time zone unless configured through date-fns options.
 * Day and week arithmetic uses calendar days, preserving local wall-clock time across daylight saving changes.
 * Hour, minute, second, and millisecond arithmetic uses elapsed durations. Month and year arithmetic clamps
 * to the last valid day of the destination month; native setters keep their overflow behavior.
 * Operations can preserve or produce `Invalid Date`.
 *
 * When used in Vue state, prefer replacing the value with a `to`-prefixed result:
 * mutating a Date's internal timestamp does not trigger reactive updates.
 *
 * @example
 *
 * ```ts
 * import { EnhancedDate } from '@kikiutils/shared/classes/enhanced-date';
 *
 * const date = new EnhancedDate('2026-01-31T12:00:00Z');
 * const nextMonth = date.toAddMonths(1); // Original date is unchanged.
 * date.addDays(1).startOfDay(); // Mutates the original date.
 * nextMonth.isAfter(date);
 * ```
 */
export class EnhancedDate extends Date {
    // Public static methods

    static endOfToday() {
        return new EnhancedDate(dateFns.endOfToday());
    }

    static endOfTomorrow() {
        return new EnhancedDate(dateFns.endOfTomorrow());
    }

    static endOfYesterday() {
        return new EnhancedDate(dateFns.endOfYesterday());
    }

    /**
     * Parses a date with a date-fns pattern; `referenceDate` supplies the fields the pattern does not contain.
     */
    static fromFormat(
        value: string,
        pattern: string,
        referenceDate: dateFns.DateArg<Date>,
        options?: dateFns.ParseOptions,
    ) {
        return new EnhancedDate(dateFns.parse(value, pattern, referenceDate, options));
    }

    /**
     * Parses an ISO 8601 string, including partial dates such as `2026-01`.
     */
    static fromISO(value: string, options?: dateFns.ParseISOOptions) {
        return new EnhancedDate(dateFns.parseISO(value, options));
    }

    /**
     * Creates a date from Unix seconds; native constructor numbers remain milliseconds.
     */
    static fromUnixSeconds(seconds: number) {
        return new EnhancedDate(seconds * 1000);
    }

    /**
     * Returns the latest date, or `Invalid Date` if the array is empty or contains an invalid date.
     */
    static max(dates: Array<Date | number>) {
        return new EnhancedDate(dateFns.max(dates));
    }

    /**
     * Returns the earliest date, or `Invalid Date` if the array is empty or contains an invalid date.
     */
    static min(dates: Array<Date | number>) {
        return new EnhancedDate(dateFns.min(dates));
    }

    static startOfToday() {
        return new EnhancedDate(dateFns.startOfToday());
    }

    static startOfTomorrow() {
        return new EnhancedDate(dateFns.startOfTomorrow());
    }

    static startOfYesterday() {
        return new EnhancedDate(dateFns.startOfYesterday());
    }

    // Private instance methods
    #set(date: Date) {
        this.setTime(date.getTime());
        return this;
    }

    // Public instance methods

    addDays(amount: number) {
        return this.#set(dateFns.addDays(this, amount));
    }

    addHours(amount: number) {
        return this.#set(dateFns.addHours(this, amount));
    }

    addMilliseconds(amount: number) {
        return this.#set(dateFns.addMilliseconds(this, amount));
    }

    addMinutes(amount: number) {
        return this.#set(dateFns.addMinutes(this, amount));
    }

    addMonths(amount: number) {
        return this.#set(dateFns.addMonths(this, amount));
    }

    addSeconds(amount: number) {
        return this.#set(dateFns.addSeconds(this, amount));
    }

    addWeeks(amount: number) {
        return this.#set(dateFns.addWeeks(this, amount));
    }

    addYears(amount: number) {
        return this.#set(dateFns.addYears(this, amount));
    }

    clone() {
        return new EnhancedDate(this.getTime());
    }

    /**
     * Returns the signed difference in calendar days: this date minus the other date.
     */
    differenceInCalendarDays(other: dateFns.DateArg<Date>) {
        return dateFns.differenceInCalendarDays(this, other);
    }

    /**
     * Returns the signed difference in calendar weeks: this date minus the other date.
     */
    differenceInCalendarWeeks(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInCalendarWeeksOptions) {
        return dateFns.differenceInCalendarWeeks(this, other, options);
    }

    /**
     * Returns the signed difference in full minutes: this date minus the other date.
     */
    differenceInMinutes(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInMinutesOptions) {
        return dateFns.differenceInMinutes(this, other, options);
    }

    /**
     * Returns the signed difference in full seconds: this date minus the other date.
     */
    differenceInSeconds(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInSecondsOptions) {
        return dateFns.differenceInSeconds(this, other, options);
    }

    endOfDay() {
        return this.#set(dateFns.endOfDay(this));
    }

    endOfMinute() {
        return this.#set(dateFns.endOfMinute(this));
    }

    endOfMonth() {
        return this.#set(dateFns.endOfMonth(this));
    }

    endOfWeek(options?: dateFns.EndOfWeekOptions) {
        return this.#set(dateFns.endOfWeek(this, options));
    }

    /**
     * Formats this date with a date-fns pattern (default: `yyyy-MM-dd HH:mm:ss`).
     */
    format(pattern: string = 'yyyy-MM-dd HH:mm:ss', options?: dateFns.FormatOptions) {
        return dateFns.format(this, pattern, options);
    }

    formatDistanceToNow(options?: dateFns.FormatDistanceToNowOptions) {
        return dateFns.formatDistanceToNow(this, options);
    }

    /**
     * Returns Unix seconds; `getTime()` returns milliseconds.
     */
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

    isSameDay(other: dateFns.DateArg<Date>) {
        return dateFns.isSameDay(this, other);
    }

    isSameMinute(other: dateFns.DateArg<Date>) {
        return dateFns.isSameMinute(this, other);
    }

    isToday() {
        return dateFns.isToday(this);
    }

    isTomorrow() {
        return dateFns.isTomorrow(this);
    }

    isValid() {
        return dateFns.isValid(this);
    }

    startOfDay() {
        return this.#set(dateFns.startOfDay(this));
    }

    startOfMinute() {
        return this.#set(dateFns.startOfMinute(this));
    }

    startOfMonth() {
        return this.#set(dateFns.startOfMonth(this));
    }

    startOfWeek(options?: dateFns.StartOfWeekOptions) {
        return this.#set(dateFns.startOfWeek(this, options));
    }

    subDays(amount: number) {
        return this.#set(dateFns.subDays(this, amount));
    }

    subHours(amount: number) {
        return this.#set(dateFns.subHours(this, amount));
    }

    subMilliseconds(amount: number) {
        return this.#set(dateFns.subMilliseconds(this, amount));
    }

    subMinutes(amount: number) {
        return this.#set(dateFns.subMinutes(this, amount));
    }

    subMonths(amount: number) {
        return this.#set(dateFns.subMonths(this, amount));
    }

    subSeconds(amount: number) {
        return this.#set(dateFns.subSeconds(this, amount));
    }

    subWeeks(amount: number) {
        return this.#set(dateFns.subWeeks(this, amount));
    }

    subYears(amount: number) {
        return this.#set(dateFns.subYears(this, amount));
    }

    toAddDays(amount: number) {
        return this.clone().addDays(amount);
    }

    toAddHours(amount: number) {
        return this.clone().addHours(amount);
    }

    toAddMilliseconds(amount: number) {
        return this.clone().addMilliseconds(amount);
    }

    toAddMinutes(amount: number) {
        return this.clone().addMinutes(amount);
    }

    toAddMonths(amount: number) {
        return this.clone().addMonths(amount);
    }

    toAddSeconds(amount: number) {
        return this.clone().addSeconds(amount);
    }

    toAddWeeks(amount: number) {
        return this.clone().addWeeks(amount);
    }

    toAddYears(amount: number) {
        return this.clone().addYears(amount);
    }

    /**
     * Returns a plain native `Date` with the same timestamp.
     */
    toDate() {
        return new Date(this.getTime());
    }

    toEndOfDay() {
        return this.clone().endOfDay();
    }

    toEndOfMinute() {
        return this.clone().endOfMinute();
    }

    toEndOfMonth() {
        return this.clone().endOfMonth();
    }

    toEndOfWeek(options?: dateFns.EndOfWeekOptions) {
        return this.clone().endOfWeek(options);
    }

    toStartOfDay() {
        return this.clone().startOfDay();
    }

    toStartOfMinute() {
        return this.clone().startOfMinute();
    }

    toStartOfMonth() {
        return this.clone().startOfMonth();
    }

    toStartOfWeek(options?: dateFns.StartOfWeekOptions) {
        return this.clone().startOfWeek(options);
    }

    toSubDays(amount: number) {
        return this.clone().subDays(amount);
    }

    toSubHours(amount: number) {
        return this.clone().subHours(amount);
    }

    toSubMilliseconds(amount: number) {
        return this.clone().subMilliseconds(amount);
    }

    toSubMinutes(amount: number) {
        return this.clone().subMinutes(amount);
    }

    toSubMonths(amount: number) {
        return this.clone().subMonths(amount);
    }

    toSubSeconds(amount: number) {
        return this.clone().subSeconds(amount);
    }

    toSubWeeks(amount: number) {
        return this.clone().subWeeks(amount);
    }

    toSubYears(amount: number) {
        return this.clone().subYears(amount);
    }
}
