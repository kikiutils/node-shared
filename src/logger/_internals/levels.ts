import type { LoggerMethod } from '../types';

// Constants/Variables
export const loggerMethods = {
    debug: {
        ansiColor: '36',
        consoleMethod: 'debug',
        cssColor: '#0891b2',
        icon: '⚙',
        severity: 20,
    },
    error: {
        ansiColor: '31',
        consoleMethod: 'error',
        cssColor: '#dc2626',
        icon: '✖',
        severity: 50,
    },
    fatal: {
        ansiColor: '31',
        consoleMethod: 'error',
        cssColor: '#dc2626',
        icon: '✖',
        severity: 60,
    },
    info: {
        ansiColor: '36',
        consoleMethod: 'info',
        cssColor: '#0891b2',
        icon: 'ℹ',
        severity: 30,
    },
    success: {
        ansiColor: '32',
        consoleMethod: 'info',
        cssColor: '#16a34a',
        icon: '✔',
        severity: 30,
    },
    trace: {
        ansiColor: '90',
        consoleMethod: 'debug',
        cssColor: '#808080',
        icon: '·',
        severity: 10,
    },
    warn: {
        ansiColor: '33',
        consoleMethod: 'warn',
        cssColor: '#ca8a04',
        icon: '⚠',
        severity: 40,
    },
} as const;

// Functions
export function getLoggerStreamName(type: LoggerMethod): 'stderr' | 'stdout' {
    const method = loggerMethods[type].consoleMethod;
    return method === 'warn' || method === 'error' ? 'stderr' : 'stdout';
}
