import { addDays, format as dateFnsFormat } from 'date-fns';

import { formatDateOrTimestamp, getDateRangeFromDate, getMidnightDateFromToday } from '../src/datetime';

describe('formatDateOrTimestamp', () => {
    it('should format a Date object', () => {
        const date = new Date('2024-07-10T00:00:00Z');
        const formattedDate = formatDateOrTimestamp(date, 'yyyy-MM-dd');
        expect(formattedDate).toBe('2024-07-10');
    });

    it('should format a numeric timestamp', () => {
        const timestamp = 1657814400000;
        const formattedTimestamp = formatDateOrTimestamp(timestamp, 'yyyy-MM-dd HH:mm');
        expect(formattedTimestamp).toBe('2022-07-14 16:00');
    });

    it('should format a date string', () => {
        const dateString = '2024-07-10T00:00:00Z';
        const formattedString = formatDateOrTimestamp(dateString, 'yyyy-MM-dd');
        expect(formattedString).toBe('2024-07-10');
    });

    it('should format with the default format', () => {
        const date = new Date('2024-07-10T00:00:00Z');
        const formattedDate = formatDateOrTimestamp(date);
        expect(formattedDate).toBe(dateFnsFormat(date, 'yyyy-MM-dd HH:mm:ss'));
    });
});

describe('getDateRangeFromDate', () => {
    const referenceDate = new Date('2023-07-01T12:00:00Z');
    it('should return correct range for last month', () => {
        const range = getDateRangeFromDate(referenceDate, 'lastMonth');
        expect(range.startDate).toEqual(new Date('2023-06-01 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-06-30 23:59:59.999'));
    });

    it('should return correct range for last week', () => {
        const range = getDateRangeFromDate(referenceDate, 'lastWeek');
        expect(range.startDate).toEqual(new Date('2023-06-19 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-06-25 23:59:59.999'));
        const startWeekZeroRange = getDateRangeFromDate(referenceDate, 'lastWeek', { weekStartsOn: 0 });
        expect(startWeekZeroRange.startDate).toEqual(new Date('2023-06-18 00:00:00'));
        expect(startWeekZeroRange.endDate).toEqual(new Date('2023-06-24 23:59:59.999'));
    });

    it('should return correct range for this month', () => {
        const range = getDateRangeFromDate(referenceDate, 'thisMonth');
        expect(range.startDate).toEqual(new Date('2023-07-01 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-07-31 23:59:59.999'));
    });

    it('should return correct range for this week', () => {
        const range = getDateRangeFromDate(referenceDate, 'thisWeek');
        expect(range.startDate).toEqual(new Date('2023-06-26 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-07-02 23:59:59.999'));
        const startWeekZeroRange = getDateRangeFromDate(referenceDate, 'thisWeek', { weekStartsOn: 0 });
        expect(startWeekZeroRange.startDate).toEqual(new Date('2023-06-25 00:00:00'));
        expect(startWeekZeroRange.endDate).toEqual(new Date('2023-07-01 23:59:59.999'));
    });

    it('should return correct range for today', () => {
        const range = getDateRangeFromDate(referenceDate, 'today');
        expect(range.startDate).toEqual(new Date('2023-07-01 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-07-01 23:59:59.999'));
    });

    it('should return correct range for yesterday', () => {
        const range = getDateRangeFromDate(referenceDate, 'yesterday');
        expect(range.startDate).toEqual(new Date('2023-06-30 00:00:00'));
        expect(range.endDate).toEqual(new Date('2023-06-30 23:59:59.999'));
    });

    it('should set end date to next day start when setEndDateToNextDayStart is true', () => {
        const range = getDateRangeFromDate(referenceDate, 'today', { setEndDateToNextDayStart: true });
        expect(range.endDate).toEqual(new Date('2023-07-02 00:00:00.000 '));
    });
});

describe('getMidnightDateFromToday', () => {
    it(`should return today's midnight date`, () => {
        const todayMidnight = getMidnightDateFromToday();
        const expectedMidnight = new Date();
        expectedMidnight.setHours(0, 0, 0, 0);
        expect(todayMidnight).toEqual(expectedMidnight);
    });

    it('should return midnight date offset by the specified number of days', () => {
        const offsetDays = 3;
        const midnightIn3Days = getMidnightDateFromToday(offsetDays);
        const expectedDate = addDays(new Date(), offsetDays);
        expectedDate.setHours(0, 0, 0, 0);
        expect(midnightIn3Days).toEqual(expectedDate);
    });

    it('should return midnight date offset by a negative number of days', () => {
        const offsetDays = -3;
        const midnightInPast = getMidnightDateFromToday(offsetDays);
        const expectedDate = addDays(new Date(), offsetDays);
        expectedDate.setHours(0, 0, 0, 0);
        expect(midnightInPast).toEqual(expectedDate);
    });
});
