import { inspect } from 'node:util';

import { formatLoggerParts } from '../../_internals/formatter';
import type { LoggerRecord } from '../../_internals/types';

/**
 * User ANSI sequences are preserved; the caller strips them for file output. Custom inspect callbacks run like
 * `console.log`, other property getters are not invoked, and an argument whose inspection throws is replaced instead
 * of dropping the record.
 */
export function formatNodeLoggerRecord(
    record: LoggerRecord,
    colors = false,
    onInspectError?: (error: unknown) => void,
) {
    const message = record.args.map((arg) => {
        if (typeof arg === 'string') return arg;
        try {
            return inspect(
                arg,
                {
                    colors: false,
                    customInspect: true,
                    depth: 6,
                    getters: false,
                    maxArrayLength: 100,
                    maxStringLength: 10_000,
                },
            );
        } catch (error) {
            onInspectError?.(error);
            return '[uninspectable value]';
        }
    }).join(' ');

    return formatLoggerParts(
        {
            ...record,
            args: record.args.length ? [message] : [],
        },
        colors,
    ).join(' ');
}
