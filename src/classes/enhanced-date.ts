import * as dateFns from 'date-fns';

/**
 * A mutable calendar date with chainable date-fns operations.
 *
 * @remarks
 * Inherits the native constructor, including zero-based month arguments and millisecond timestamps.
 * Native methods retain their original behavior.
 * Mutating arithmetic and boundary methods update this instance and return `this`;
 * their `to`-prefixed counterparts return a new `EnhancedDate` instead.
 * Invalid dates, parsing, rounding, and week defaults follow date-fns semantics.
 * Operations use the system time zone unless configured through date-fns options.
 * Day and week arithmetic uses calendar days, preserving local wall-clock time across daylight saving changes.
 * Hour, minute, second, and millisecond arithmetic uses elapsed durations. Month and year arithmetic clamps
 * to the last valid day of the destination month. Native setters retain their native overflow behavior.
 * Exceptions from date-fns propagate unchanged, and operations can preserve or produce `Invalid Date`.
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

    /**
     * Returns a new instance at the end of today in the system time zone.
     */
    static endOfToday() {
        return new EnhancedDate(dateFns.endOfToday());
    }

    /**
     * Returns a new instance at the end of tomorrow in the system time zone.
     */
    static endOfTomorrow() {
        return new EnhancedDate(dateFns.endOfTomorrow());
    }

    /**
     * Returns a new instance at the end of yesterday in the system time zone.
     */
    static endOfYesterday() {
        return new EnhancedDate(dateFns.endOfYesterday());
    }

    /**
     * Parses a date using date-fns and an explicit reference for missing fields.
     *
     * @param value - Date string to parse.
     * @param pattern - date-fns parsing pattern.
     * @param referenceDate - Reference for fields absent from the pattern.
     * @param options - Options passed to `date-fns/parse`.
     *
     * @returns A new `EnhancedDate`, including `Invalid Date` for invalid values.
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
     * Parses an ISO 8601 string using date-fns, including its partial-date support.
     *
     * @param value - ISO date string.
     * @param options - Options passed to `date-fns/parseISO`.
     *
     * @returns A new `EnhancedDate`, or `Invalid Date` when parsing fails.
     */
    static fromISO(value: string, options?: dateFns.ParseISOOptions) {
        return new EnhancedDate(dateFns.parseISO(value, options));
    }

    /**
     * Creates a date from Unix seconds; native constructor numbers remain milliseconds.
     *
     * @param seconds - Seconds since the Unix epoch.
     */
    static fromUnixSeconds(seconds: number) {
        return new EnhancedDate(seconds * 1000);
    }

    /**
     * Returns the latest date as a new independent instance.
     *
     * @param dates - Dates or millisecond timestamps to compare.
     *
     * @returns A new `EnhancedDate`, or `Invalid Date` if the array is empty or contains an invalid date.
     */
    static max(dates: (Date | number)[]) {
        return new EnhancedDate(dateFns.max(dates));
    }

    /**
     * Returns the earliest date as a new independent instance.
     *
     * @param dates - Dates or millisecond timestamps to compare.
     *
     * @returns A new `EnhancedDate`, or `Invalid Date` if the array is empty or contains an invalid date.
     */
    static min(dates: (Date | number)[]) {
        return new EnhancedDate(dateFns.min(dates));
    }

    /**
     * Returns a new instance at the start of today in the system time zone.
     */
    static startOfToday() {
        return new EnhancedDate(dateFns.startOfToday());
    }

    /**
     * Returns a new instance at the start of tomorrow in the system time zone.
     */
    static startOfTomorrow() {
        return new EnhancedDate(dateFns.startOfTomorrow());
    }

    /**
     * Returns a new instance at the start of yesterday in the system time zone.
     */
    static startOfYesterday() {
        return new EnhancedDate(dateFns.startOfYesterday());
    }

    // Public instance methods

    /**
     * Adds the specified number of days in place using date-fns.
     *
     * @param amount - Number of days.
     *
     * @returns This instance for chaining.
     */
    addDays(amount: number) {
        this.setTime(dateFns.addDays(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of hours in place using date-fns.
     *
     * @param amount - Number of hours.
     *
     * @returns This instance for chaining.
     */
    addHours(amount: number) {
        this.setTime(dateFns.addHours(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of milliseconds in place using date-fns.
     *
     * @param amount - Number of milliseconds.
     *
     * @returns This instance for chaining.
     */
    addMilliseconds(amount: number) {
        this.setTime(dateFns.addMilliseconds(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of minutes in place using date-fns.
     *
     * @param amount - Number of minutes.
     *
     * @returns This instance for chaining.
     */
    addMinutes(amount: number) {
        this.setTime(dateFns.addMinutes(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of months in place using date-fns.
     *
     * @param amount - Number of months.
     *
     * @returns This instance for chaining.
     */
    addMonths(amount: number) {
        this.setTime(dateFns.addMonths(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of seconds in place using date-fns.
     *
     * @param amount - Number of seconds.
     *
     * @returns This instance for chaining.
     */
    addSeconds(amount: number) {
        this.setTime(dateFns.addSeconds(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of weeks in place using date-fns.
     *
     * @param amount - Number of weeks.
     *
     * @returns This instance for chaining.
     */
    addWeeks(amount: number) {
        this.setTime(dateFns.addWeeks(this, amount).getTime());
        return this;
    }

    /**
     * Adds the specified number of years in place using date-fns.
     *
     * @param amount - Number of years.
     *
     * @returns This instance for chaining.
     */
    addYears(amount: number) {
        this.setTime(dateFns.addYears(this, amount).getTime());
        return this;
    }

    /**
     * Returns a new `EnhancedDate` with the same timestamp, including `Invalid Date`.
     */
    clone() {
        return new EnhancedDate(this.getTime());
    }

    /**
     * Returns the signed difference in calendar days: this date minus the other date.
     *
     * @remarks
     * Defaults and rounding follow date-fns.
     */
    differenceInCalendarDays(other: dateFns.DateArg<Date>) {
        return dateFns.differenceInCalendarDays(this, other);
    }

    /**
     * Returns the signed difference in calendar weeks: this date minus the other date.
     *
     * @remarks
     * Defaults and rounding follow date-fns.
     */
    differenceInCalendarWeeks(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInCalendarWeeksOptions) {
        return dateFns.differenceInCalendarWeeks(this, other, options);
    }

    /**
     * Returns the signed difference in full minutes: this date minus the other date.
     *
     * @remarks
     * Defaults and rounding follow date-fns.
     */
    differenceInMinutes(other: dateFns.DateArg<Date>, options?: dateFns.DifferenceInMinutesOptions) {
        return dateFns.differenceInMinutes(this, other, options);
    }

    /**
     * Moves this date to the end of its day in place.
     *
     * @returns This instance for chaining.
     */
    endOfDay() {
        this.setTime(dateFns.endOfDay(this).getTime());
        return this;
    }

    /**
     * Moves this date to the end of its minute in place.
     *
     * @returns This instance for chaining.
     */
    endOfMinute() {
        this.setTime(dateFns.endOfMinute(this).getTime());
        return this;
    }

    /**
     * Moves this date to the end of its month in place.
     *
     * @returns This instance for chaining.
     */
    endOfMonth() {
        this.setTime(dateFns.endOfMonth(this).getTime());
        return this;
    }

    /**
     * Moves this date to the end of its week in place.
     *
     * @param options - date-fns week options; defaults are unchanged.
     *
     * @returns This instance for chaining.
     */
    endOfWeek(options?: dateFns.EndOfWeekOptions) {
        this.setTime(dateFns.endOfWeek(this, options).getTime());
        return this;
    }

    /**
     * Formats this date using a date-fns pattern (default: `yyyy-MM-dd HH:mm:ss`) and optional locale/options.
     *
     * @remarks
     * Invalid dates and invalid patterns retain date-fns error behavior.
     */
    format(pattern: string = 'yyyy-MM-dd HH:mm:ss', options?: dateFns.FormatOptions) {
        return dateFns.format(this, pattern, options);
    }

    /**
     * Formats the distance from this date to now using date-fns.
     */
    formatDistanceToNow(options?: dateFns.FormatDistanceToNowOptions) {
        return dateFns.formatDistanceToNow(this, options);
    }

    /**
     * Returns Unix seconds using date-fns; `getTime()` returns milliseconds.
     */
    getUnixTime() {
        return dateFns.getUnixTime(this);
    }

    /**
     * Checks whether this date occurs after the other date.
     */
    isAfter(other: dateFns.DateArg<Date>) {
        return dateFns.isAfter(this, other);
    }

    /**
     * Checks whether this date occurs before the other date.
     */
    isBefore(other: dateFns.DateArg<Date>) {
        return dateFns.isBefore(this, other);
    }

    /**
     * Checks whether this date has the same timestamp as the other date.
     */
    isEqual(other: dateFns.DateArg<Date>) {
        return dateFns.isEqual(this, other);
    }

    /**
     * Checks whether this date is after the current time.
     */
    isFuture() {
        return dateFns.isFuture(this);
    }

    /**
     * Checks whether this date falls on the same calendar day as the other date.
     */
    isSameDay(other: dateFns.DateArg<Date>) {
        return dateFns.isSameDay(this, other);
    }

    /**
     * Checks whether this date falls in the same calendar minute as the other date.
     */
    isSameMinute(other: dateFns.DateArg<Date>) {
        return dateFns.isSameMinute(this, other);
    }

    /**
     * Checks whether this date falls on today.
     */
    isToday() {
        return dateFns.isToday(this);
    }

    /**
     * Checks whether this date falls on tomorrow.
     */
    isTomorrow() {
        return dateFns.isTomorrow(this);
    }

    /**
     * Checks whether this date has a valid timestamp.
     */
    isValid() {
        return dateFns.isValid(this);
    }

    /**
     * Moves this date to the start of its day in place.
     *
     * @returns This instance for chaining.
     */
    startOfDay() {
        this.setTime(dateFns.startOfDay(this).getTime());
        return this;
    }

    /**
     * Moves this date to the start of its minute in place.
     *
     * @returns This instance for chaining.
     */
    startOfMinute() {
        this.setTime(dateFns.startOfMinute(this).getTime());
        return this;
    }

    /**
     * Moves this date to the start of its month in place.
     *
     * @returns This instance for chaining.
     */
    startOfMonth() {
        this.setTime(dateFns.startOfMonth(this).getTime());
        return this;
    }

    /**
     * Moves this date to the start of its week in place.
     *
     * @param options - date-fns week options; defaults are unchanged.
     *
     * @returns This instance for chaining.
     */
    startOfWeek(options?: dateFns.StartOfWeekOptions) {
        this.setTime(dateFns.startOfWeek(this, options).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of days in place using date-fns.
     *
     * @param amount - Number of days.
     *
     * @returns This instance for chaining.
     */
    subDays(amount: number) {
        this.setTime(dateFns.subDays(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of hours in place using date-fns.
     *
     * @param amount - Number of hours.
     *
     * @returns This instance for chaining.
     */
    subHours(amount: number) {
        this.setTime(dateFns.subHours(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of milliseconds in place using date-fns.
     *
     * @param amount - Number of milliseconds.
     *
     * @returns This instance for chaining.
     */
    subMilliseconds(amount: number) {
        this.setTime(dateFns.subMilliseconds(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of minutes in place using date-fns.
     *
     * @param amount - Number of minutes.
     *
     * @returns This instance for chaining.
     */
    subMinutes(amount: number) {
        this.setTime(dateFns.subMinutes(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of months in place using date-fns.
     *
     * @param amount - Number of months.
     *
     * @returns This instance for chaining.
     */
    subMonths(amount: number) {
        this.setTime(dateFns.subMonths(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of seconds in place using date-fns.
     *
     * @param amount - Number of seconds.
     *
     * @returns This instance for chaining.
     */
    subSeconds(amount: number) {
        this.setTime(dateFns.subSeconds(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of weeks in place using date-fns.
     *
     * @param amount - Number of weeks.
     *
     * @returns This instance for chaining.
     */
    subWeeks(amount: number) {
        this.setTime(dateFns.subWeeks(this, amount).getTime());
        return this;
    }

    /**
     * Subtracts the specified number of years in place using date-fns.
     *
     * @param amount - Number of years.
     *
     * @returns This instance for chaining.
     */
    subYears(amount: number) {
        this.setTime(dateFns.subYears(this, amount).getTime());
        return this;
    }

    /**
     * Returns a new instance with days added, leaving this date unchanged.
     */
    toAddDays(amount: number) {
        return this.clone().addDays(amount);
    }

    /**
     * Returns a new instance with hours added, leaving this date unchanged.
     */
    toAddHours(amount: number) {
        return this.clone().addHours(amount);
    }

    /**
     * Returns a new instance with milliseconds added, leaving this date unchanged.
     */
    toAddMilliseconds(amount: number) {
        return this.clone().addMilliseconds(amount);
    }

    /**
     * Returns a new instance with minutes added, leaving this date unchanged.
     */
    toAddMinutes(amount: number) {
        return this.clone().addMinutes(amount);
    }

    /**
     * Returns a new instance with months added, leaving this date unchanged.
     */
    toAddMonths(amount: number) {
        return this.clone().addMonths(amount);
    }

    /**
     * Returns a new instance with seconds added, leaving this date unchanged.
     */
    toAddSeconds(amount: number) {
        return this.clone().addSeconds(amount);
    }

    /**
     * Returns a new instance with weeks added, leaving this date unchanged.
     */
    toAddWeeks(amount: number) {
        return this.clone().addWeeks(amount);
    }

    /**
     * Returns a new instance with years added, leaving this date unchanged.
     */
    toAddYears(amount: number) {
        return this.clone().addYears(amount);
    }

    /**
     * Returns a new plain native Date; mutations are not shared with this instance.
     */
    toDate() {
        return new Date(this.getTime());
    }

    /**
     * Returns a new instance at the end of this day, leaving this date unchanged.
     */
    toEndOfDay() {
        return this.clone().endOfDay();
    }

    /**
     * Returns a new instance at the end of this minute, leaving this date unchanged.
     */
    toEndOfMinute() {
        return this.clone().endOfMinute();
    }

    /**
     * Returns a new instance at the end of this month, leaving this date unchanged.
     */
    toEndOfMonth() {
        return this.clone().endOfMonth();
    }

    /**
     * Returns a new instance at the end of this week, leaving this date unchanged.
     */
    toEndOfWeek(options?: dateFns.EndOfWeekOptions) {
        return this.clone().endOfWeek(options);
    }

    /**
     * Returns a new instance at the start of this day, leaving this date unchanged.
     */
    toStartOfDay() {
        return this.clone().startOfDay();
    }

    /**
     * Returns a new instance at the start of this minute, leaving this date unchanged.
     */
    toStartOfMinute() {
        return this.clone().startOfMinute();
    }

    /**
     * Returns a new instance at the start of this month, leaving this date unchanged.
     */
    toStartOfMonth() {
        return this.clone().startOfMonth();
    }

    /**
     * Returns a new instance at the start of this week, leaving this date unchanged.
     */
    toStartOfWeek(options?: dateFns.StartOfWeekOptions) {
        return this.clone().startOfWeek(options);
    }

    /**
     * Returns a new instance with days subtracted, leaving this date unchanged.
     */
    toSubDays(amount: number) {
        return this.clone().subDays(amount);
    }

    /**
     * Returns a new instance with hours subtracted, leaving this date unchanged.
     */
    toSubHours(amount: number) {
        return this.clone().subHours(amount);
    }

    /**
     * Returns a new instance with milliseconds subtracted, leaving this date unchanged.
     */
    toSubMilliseconds(amount: number) {
        return this.clone().subMilliseconds(amount);
    }

    /**
     * Returns a new instance with minutes subtracted, leaving this date unchanged.
     */
    toSubMinutes(amount: number) {
        return this.clone().subMinutes(amount);
    }

    /**
     * Returns a new instance with months subtracted, leaving this date unchanged.
     */
    toSubMonths(amount: number) {
        return this.clone().subMonths(amount);
    }

    /**
     * Returns a new instance with seconds subtracted, leaving this date unchanged.
     */
    toSubSeconds(amount: number) {
        return this.clone().subSeconds(amount);
    }

    /**
     * Returns a new instance with weeks subtracted, leaving this date unchanged.
     */
    toSubWeeks(amount: number) {
        return this.clone().subWeeks(amount);
    }

    /**
     * Returns a new instance with years subtracted, leaving this date unchanged.
     */
    toSubYears(amount: number) {
        return this.clone().subYears(amount);
    }
}
