import {
    getLoggerStreamName,
    loggerMethods,
} from './levels';
import type { LoggerRecord } from './types';

// Functions

/** Native console formatting keeps user strings literal and objects expandable. */
export function formatLoggerConsoleArgs(record: LoggerRecord): unknown[] {
    if (typeof process !== 'undefined' && process.versions?.node) {
        const target = process[getLoggerStreamName(record.type)];
        const parts = formatLoggerParts(record, supportsLoggerColor(target));
        return [
            parts.map((part) => typeof part === 'string' ? '%s' : '%O').join(' '),
            ...parts,
        ];
    }

    const format: string[] = [];
    const args: unknown[] = [];
    const decorate = (text: string, color: string) => {
        format.push('%c%s%c');
        args.push(`color: ${color}`, text, '');
    };

    if (record.icons) decorate(loggerMethods[record.type].icon, loggerMethods[record.type].cssColor);
    if (record.timestamp) decorate(formatLoggerTime(record.date), '#808080');
    if (record.prefix) decorate(record.prefix, '#0891b2');
    for (const arg of record.args) {
        format.push(typeof arg === 'string' ? '%s' : '%o');
        args.push(arg);
    }

    if (record.suffix) decorate(record.suffix, '#0891b2');
    return [
        format.join(' '),
        ...args,
    ];
}

/** Keeps data arguments intact so browser developer tools can expand objects. */
export function formatLoggerParts(record: LoggerRecord, colors = false): unknown[] {
    const parts: unknown[] = [];
    const paint = (text: string, color: string) => colors ? `\u001B[${color}m${text}\u001B[0m` : text;
    if (record.icons) parts.push(paint(loggerMethods[record.type].icon, loggerMethods[record.type].ansiColor));
    if (record.timestamp) parts.push(paint(formatLoggerTime(record.date), '90'));
    if (record.prefix) parts.push(paint(record.prefix, '36'));
    parts.push(...record.args);
    if (record.suffix) parts.push(paint(record.suffix, '36'));
    return parts;
}

/** Fixed local-time representation, deliberately without a per-second cache. */
export function formatLoggerTime(date: Date): string {
    const pad = (value: number, width = 2) => String(value).padStart(width, '0');
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return `[${day} ${time}.${pad(date.getMilliseconds(), 3)}]`;
}

/** Use native terminal detection; redirected streams still honor FORCE_COLOR. */
export function supportsLoggerColor(target: { hasColors?: () => boolean; isTTY?: boolean }): boolean {
    if (target.hasColors) return target.hasColors();
    const forced = process.env.FORCE_COLOR;
    if (forced !== undefined) {
        return [
            '',
            '1',
            '2',
            '3',
            'true',
        ].includes(forced);
    }

    return Boolean(target.isTTY)
      && !process.env.NO_COLOR
      && !process.env.NODE_DISABLE_COLORS
      && process.env.TERM !== 'dumb';
}
