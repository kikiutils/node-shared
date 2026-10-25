import { inspect } from 'node:util';

import { formatLoggerParts } from '../../_internals/formatter';
import type { LoggerRecord } from '../../_internals/types';

// Functions

/** Preserve user ANSI for console output without invoking custom inspect callbacks/getters. */
export function formatNodeLoggerRecord(record: LoggerRecord, colors = false) {
    const message = record.args.map(
        (arg) => typeof arg === 'string'
            ? arg
            : inspect(
                arg,
                {
                    colors: false,
                    customInspect: false,
                    depth: 6,
                    getters: false,
                    maxArrayLength: 100,
                    maxStringLength: 10_000,
                },
            ),
    ).join(' ');

    return formatLoggerParts(
        {
            ...record,
            args: record.args.length ? [message] : [],
        },
        colors,
    ).join(' ');
}
