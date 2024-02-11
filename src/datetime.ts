import { format as dateFnsFormat } from 'date-fns';
import type { FormatOptions } from 'date-fns';

export const formatDateOrTimestamp = (dateOrTimestamp: Date | number | string, format: string = 'yyyy-MM-dd HH:mm:ss', options?: FormatOptions) => dateFnsFormat(dateOrTimestamp, format, options);
export const getMidnightDateFromToday = (offsetDays: number = 0) => {
	const date = new Date();
	date.setDate(date.getDate() + offsetDays);
	date.setHours(0, 0, 0, 0);
	return date;
};
