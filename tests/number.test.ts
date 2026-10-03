import { millify } from 'millify';
import {
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { toCompactNumberString } from '../src/number';

vi.mock('millify');

beforeEach(() => {
    vi.resetAllMocks();
});

describe('toCompactNumberString', () => {
    it('should forward the value with default precision and lowercase units', ({ expect }) => {
        vi.mocked(millify).mockReturnValue('1.23m');

        const result = toCompactNumberString(1234567);

        expect(result).toBe('1.23m');
        expect(millify).toHaveBeenCalledExactlyOnceWith(
            1234567,
            {
                lowercase: true,
                precision: 2,
            },
        );
    });

    it('should let explicit options override defaults without mutating them', ({ expect }) => {
        const options = Object.freeze({
            lowercase: false,
            precision: 3,
        });

        vi.mocked(millify).mockReturnValue('1.235M');

        const result = toCompactNumberString(1234567, options);

        expect(result).toBe('1.235M');
        expect(millify).toHaveBeenCalledExactlyOnceWith(1234567, options);
    });

    it('should propagate formatter errors unchanged', ({ expect }) => {
        const error = new Error('Invalid format');
        vi.mocked(millify).mockImplementation(() => {
            throw error;
        });

        expect(() => toCompactNumberString(Number.NaN)).toThrow(error);
    });
});
