import {
    getLoggerStreamName,
    loggerMethods,
} from './levels';
import type { LoggerRecord } from './types';

interface Decoration {
    ansi: string;
    css: string;
    text: string;
}

/** Native console formatting keeps user strings literal and objects expandable. */
export function formatLoggerConsoleArgs(record: LoggerRecord): unknown[] {
    // Sandboxed runtimes such as Electron preloads expose `process.versions` without stdio streams.
    const target = typeof process === 'undefined' ? undefined : process[getLoggerStreamName(record.type)];
    if (target) {
        const parts = formatLoggerParts(record, supportsLoggerColor(target));
        return [
            parts.map((part) => typeof part === 'string' ? '%s' : '%O').join(' '),
            ...parts,
        ];
    }

    const { after, before } = getDecorations(record);
    const format: string[] = [];
    const args: unknown[] = [];
    // Text goes into the format string with `%` escaped instead of through `%s`: Chromium DevTools re-parses
    // substituted text, so a message such as `50%d` would otherwise consume the next argument.
    const escape = (text: string) => text.replaceAll('%', '%%');
    const decorate = ({ css, text }: Decoration) => {
        format.push(`%c${escape(text)}%c`);
        args.push(`color: ${css}`, '');
    };

    before.forEach(decorate);
    for (const arg of record.args) {
        if (typeof arg === 'string') {
            format.push(escape(arg));
        } else {
            format.push('%o');
            args.push(arg);
        }
    }

    after.forEach(decorate);
    // A lone argument is printed without format substitution, so escaped `%%` would show up literally.
    if (!args.length) return [record.args.join(' ')];
    return [
        format.join(' '),
        ...args,
    ];
}

export function formatLoggerParts(record: LoggerRecord, colors = false): unknown[] {
    const { after, before } = getDecorations(record);
    const paint = ({ ansi, text }: Decoration) => colors ? `\u001B[${ansi}m${text}\u001B[0m` : text;
    return [
        ...before.map(paint),
        ...record.args,
        ...after.map(paint),
    ];
}

export function formatLoggerTime(date: Date): string {
    const pad = (value: number, width = 2) => String(value).padStart(width, '0');
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    return `[${day} ${time}.${pad(date.getMilliseconds(), 3)}]`;
}

/** The single source of decoration order and colors for both ANSI and browser CSS output. */
function getDecorations(record: LoggerRecord) {
    const before: Decoration[] = [];
    const after: Decoration[] = [];
    const method = loggerMethods[record.type];
    if (record.icons) {
        before.push({
            ansi: method.ansiColor,
            css: method.cssColor,
            text: method.icon,
        });
    }

    if (record.timestamp) {
        before.push({
            ansi: '90',
            css: '#808080',
            text: formatLoggerTime(record.date),
        });
    }

    if (record.prefix) {
        before.push({
            ansi: '36',
            css: '#0891b2',
            text: record.prefix,
        });
    }

    if (record.suffix) {
        after.push({
            ansi: '36',
            css: '#0891b2',
            text: record.suffix,
        });
    }

    return {
        after,
        before,
    };
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
