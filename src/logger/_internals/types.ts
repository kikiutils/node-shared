import type { LoggerMethod } from '../types';

export interface LoggerRecord {
    args: readonly unknown[];
    console: boolean;
    date: Date;
    icons: boolean;
    prefix: string;
    suffix: string;
    timestamp: boolean;
    type: LoggerMethod;
}
