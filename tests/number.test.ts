import { millify as _millify } from 'millify';
import {
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';
import type { Mock } from 'vitest';

import { toCompactNumberString } from '../src/number';

// Mocks
vi.mock('millify');
const millify = _millify as Mock;

// Tests
describe('toCompactNumberString', () => {
    beforeEach(() => vi.clearAllMocks());

    it('should convert a large number to a readable string using millify with default options', ({ expect }) => {
        millify.mockReturnValue('1.23m');

        const result = toCompactNumberString(1234567);
        expect(result).toBe('1.23m');
        expect(millify).toHaveBeenCalledWith(
            1234567,
            {
                lowercase: true,
                precision: 2,
            },
        );
    });

    it('should apply custom options to millify', ({ expect }) => {
        millify.mockReturnValue('1.235m');

        const result = toCompactNumberString(1234567, { precision: 3 });
        expect(result).toBe('1.235m');
        expect(millify).toHaveBeenCalledWith(
            1234567,
            {
                lowercase: true,
                precision: 3,
            },
        );
    });

    it('should handle smaller numbers correctly', ({ expect }) => {
        millify.mockReturnValue('123');

        const result = toCompactNumberString(123);
        expect(result).toBe('123');
        expect(millify).toHaveBeenCalledWith(
            123,
            {
                lowercase: true,
                precision: 2,
            },
        );
    });

    it('should handle large numbers with custom options', ({ expect }) => {
        millify.mockReturnValue('1.235B');

        const result = toCompactNumberString(1234567890, { precision: 3 });
        expect(result).toBe('1.235B');
        expect(millify).toHaveBeenCalledWith(
            1234567890,
            {
                lowercase: true,
                precision: 3,
            },
        );
    });
});
