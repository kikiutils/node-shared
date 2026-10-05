import { millify } from 'millify';
import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { toCompactNumberString } from '../src/number';

vi.mock('millify', { spy: true });

afterEach(() => {
    // Reset a module mock explicitly; restoreAllMocks does not reset its implementation.
    vi.mocked(millify).mockReset();
});

describe('toCompactNumberString', () => {
    it('should format the value with default precision and lowercase units', ({ expect }) => {
        expect(toCompactNumberString(1234567)).toBe('1.23m');
    });

    it('should let explicit options override defaults without mutating them', ({ expect }) => {
        const options = Object.freeze({
            lowercase: false,
            precision: 3,
        });

        expect(toCompactNumberString(1234567, options)).toBe('1.235M');
        expect(options).toEqual({
            lowercase: false,
            precision: 3,
        });
    });

    it('should propagate formatter errors unchanged', ({ expect }) => {
        const error = new Error('Invalid format');
        vi.mocked(millify).mockImplementation(() => {
            throw error;
        });

        expect(() => toCompactNumberString(Number.NaN)).toThrow(error);
    });
});
