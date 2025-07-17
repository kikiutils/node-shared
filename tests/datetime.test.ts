import {
    addDays,
    format as dateFnsFormat,
} from 'date-fns';
import {
    describe,
    it,
} from 'vitest';

import {
    formatDate,
    getDateRangeFromDate,
    getMidnightDateFromToday,
} from '../src/datetime';

describe.concurrent('formatDate', () => {
    it('should format a Date object', ({ expect }) => {
        const input = new Date('2024-07-10T00:00:00Z');

        const result = formatDate(input, 'yyyy-MM-dd');
        expect(result).toBe('2024-07-10');
    });

    it('should format a numeric timestamp', ({ expect }) => {
        const input = 1657814400000;

        const result = formatDate(input, 'yyyy-MM-dd HH:mm');
        expect(result).toBe('2022-07-14 16:00');
    });

    it('should format a date string', ({ expect }) => {
        const input = '2024-07-10T00:00:00Z';

        const result = formatDate(input, 'yyyy-MM-dd');
        expect(result).toBe('2024-07-10');
    });

    it('should format with the default format', ({ expect }) => {
        const input = new Date('2024-07-10T00:00:00Z');

        const result = formatDate(input);
        expect(result).toBe(dateFnsFormat(input, 'yyyy-MM-dd HH:mm:ss'));
    });
});

describe.concurrent('getDateRangeFromDate', () => {
    const input = new Date('2023-07-01T12:00:00Z');

    it('should return correct range for last month', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'lastMonth');
        expect(result.startDate).toEqual(new Date('2023-06-01 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-06-30 23:59:59.999'));
    });

    it('should return correct range for last week', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'lastWeek');
        expect(result.startDate).toEqual(new Date('2023-06-19 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-06-25 23:59:59.999'));
    });

    it('should return correct range for last week with weekStartsOn', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'lastWeek', { weekStartsOn: 0 });
        expect(result.startDate).toEqual(new Date('2023-06-18 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-06-24 23:59:59.999'));
    });

    it('should return correct range for this month', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'thisMonth');
        expect(result.startDate).toEqual(new Date('2023-07-01 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-07-31 23:59:59.999'));
    });

    it('should return correct range for this week', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'thisWeek');
        expect(result.startDate).toEqual(new Date('2023-06-26 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-07-02 23:59:59.999'));
    });

    it('should return correct range for this week with weekStartsOn', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'thisWeek', { weekStartsOn: 0 });
        expect(result.startDate).toEqual(new Date('2023-06-25 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-07-01 23:59:59.999'));
    });

    it('should return correct range for today', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'today');
        expect(result.startDate).toEqual(new Date('2023-07-01 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-07-01 23:59:59.999'));
    });

    it('should return correct range for yesterday', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'yesterday');
        expect(result.startDate).toEqual(new Date('2023-06-30 00:00:00'));
        expect(result.endDate).toEqual(new Date('2023-06-30 23:59:59.999'));
    });

    it('should set end date to next day start when setEndDateToNextDayStart is true', ({ expect }) => {
        const result = getDateRangeFromDate(input, 'today', { setEndDateToNextDayStart: true });
        expect(result.endDate).toEqual(new Date('2023-07-02 00:00:00.000 '));
    });

    it('should throw an error for an invalid range type', ({ expect }) => {
        expect(() => getDateRangeFromDate(input, 'invalidRangeType' as any)).toThrow(
            'Unsupported date range type: invalidRangeType',
        );
    });
});

describe.concurrent('getMidnightDateFromToday', () => {
    it(`should return today's midnight date`, ({ expect }) => {
        const expectedMidnight = new Date();
        expectedMidnight.setHours(0, 0, 0, 0);

        const result = getMidnightDateFromToday();
        expect(result).toEqual(expectedMidnight);
    });

    it('should return midnight date offset by the specified number of days', ({ expect }) => {
        const offsetDays = 3;
        const expectedDate = addDays(new Date(), offsetDays);
        expectedDate.setHours(0, 0, 0, 0);

        const result = getMidnightDateFromToday(offsetDays);
        expect(result).toEqual(expectedDate);
    });

    it('should return midnight date offset by a negative number of days', ({ expect }) => {
        const offsetDays = -3;
        const expectedDate = addDays(new Date(), offsetDays);
        expectedDate.setHours(0, 0, 0, 0);

        const result = getMidnightDateFromToday(offsetDays);
        expect(result).toEqual(expectedDate);
    });
});
