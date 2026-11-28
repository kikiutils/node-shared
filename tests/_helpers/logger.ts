import { vi } from 'vitest';

/** Fakes the clocks behind record timestamps and the diagnostic rate limit; real timers stay for stream I/O. */
export function useFakeClock(time: Date | number = 0) {
    vi.useFakeTimers({
        toFake: [
            'Date',
            'performance',
        ],
    });

    vi.setSystemTime(time);
}
