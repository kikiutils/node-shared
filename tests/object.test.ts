import {
    describe,
    it,
} from 'vitest';

import { stringifyObjectDeterministically } from '../src/object';

describe.concurrent('stringifyObjectDeterministically', () => {
    describe.concurrent('basic functionality', () => {
        it('should serialize a simple flat object', ({ expect }) => {
            const input = {
                a: 1,
                b: 2,
                c: 3,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('a=1&b=2&c=3');
        });

        it('should serialize an empty object', ({ expect }) => {
            const input = {};
            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('');
        });

        it('should handle string values', ({ expect }) => {
            const input = {
                city: 'New York',
                name: 'John',
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('city=New York&name=John');
        });

        it('should handle boolean values', ({ expect }) => {
            const input = {
                isActive: true,
                isDeleted: false,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('isActive=true&isDeleted=false');
        });

        it('should handle null and undefined values', ({ expect }) => {
            const input = {
                a: null,
                b: undefined,
                c: 'value',
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('a=null&b=undefined&c=value');
        });

        it('should handle numeric values including zero', ({ expect }) => {
            const input = {
                float: 3.14,
                negative: -17,
                positive: 42,
                zero: 0,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('float=3.14&negative=-17&positive=42&zero=0');
        });
    });

    describe.concurrent('nested objects', () => {
        it('should serialize nested objects with dot notation', ({ expect }) => {
            const input = {
                a: {
                    b: 1,
                    c: 2,
                },
                d: 3,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('a.b=1&a.c=2&d=3');
        });

        it('should handle deeply nested objects', ({ expect }) => {
            const input = { a: { b: { c: { d: 'deep' } } } };
            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('a.b.c.d=deep');
        });

        it('should serialize the example from documentation correctly', ({ expect }) => {
            const input = {
                a: {
                    x: 1,
                    y: [
                        3,
                        4,
                    ],
                },
                b: 2,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('a.x=1&a.y.0=3&a.y.1=4&b=2');
        });
    });

    describe.concurrent('arrays', () => {
        it('should serialize arrays with index notation', ({ expect }) => {
            const input = {
                arr: [
                    1,
                    2,
                    3,
                ],
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('arr.0=1&arr.1=2&arr.2=3');
        });

        it('should handle empty arrays', ({ expect }) => {
            const input = { emptyArr: [] };
            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('');
        });

        it('should handle arrays with mixed types', ({ expect }) => {
            const input = {
                mixed: [
                    1,
                    'two',
                    true,
                    null,
                ],
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('mixed.0=1&mixed.1=two&mixed.2=true&mixed.3=null');
        });

        it('should handle arrays containing objects', ({ expect }) => {
            const input = {
                items: [
                    { id: 1 },
                    { id: 2 },
                ],
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('items.0.id=1&items.1.id=2');
        });

        it('should handle nested arrays', ({ expect }) => {
            const input = {
                matrix: [
                    [
                        1,
                        2,
                    ],
                    [
                        3,
                        4,
                    ],
                ],
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('matrix.0.0=1&matrix.0.1=2&matrix.1.0=3&matrix.1.1=4');
        });
    });

    describe.concurrent('deterministic ordering', () => {
        it('should produce the same output regardless of input key order', ({ expect }) => {
            /* eslint-disable perfectionist/sort-objects */
            const input1 = {
                c: 3,
                a: 1,
                b: 2,
            };

            const input2 = {
                b: 2,
                c: 3,
                a: 1,
            };

            const input3 = {
                a: 1,
                c: 3,
                b: 2,
            };
            /* eslint-enable perfectionist/sort-objects */

            const result1 = stringifyObjectDeterministically(input1);
            const result2 = stringifyObjectDeterministically(input2);
            const result3 = stringifyObjectDeterministically(input3);

            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
            expect(result1).toBe('a=1&b=2&c=3');
        });

        it('should maintain deterministic order for nested objects', ({ expect }) => {
            /* eslint-disable perfectionist/sort-objects */
            const input1 = {
                z: {
                    b: 2,
                    a: 1,
                },
                y: 3,
            };

            const input2 = {
                y: 3,
                z: {
                    a: 1,
                    b: 2,
                },
            };
            /* eslint-enable perfectionist/sort-objects */

            const result1 = stringifyObjectDeterministically(input1);
            const result2 = stringifyObjectDeterministically(input2);

            expect(result1).toBe(result2);
            expect(result1).toBe('y=3&z.a=1&z.b=2');
        });
    });

    describe.concurrent('custom separators', () => {
        it('should use custom key-value separator', ({ expect }) => {
            const input = {
                a: 1,
                b: 2,
            };

            const result = stringifyObjectDeterministically(input, ':', '&');

            expect(result).toBe('a:1&b:2');
        });

        it('should use custom pair separator', ({ expect }) => {
            const input = {
                a: 1,
                b: 2,
            };

            const result = stringifyObjectDeterministically(input, '=', '|');

            expect(result).toBe('a=1|b=2');
        });

        it('should use both custom separators as in documentation example', ({ expect }) => {
            const input = { foo: 'bar' };
            const result = stringifyObjectDeterministically(input, ':', '|');

            expect(result).toBe('foo:bar');
        });

        it('should handle custom separators with nested objects', ({ expect }) => {
            const input = {
                a: { b: 1 },
                c: 2,
            };

            const result = stringifyObjectDeterministically(input, '->', ', ');

            expect(result).toBe('a.b->1, c->2');
        });
    });

    describe.concurrent('edge cases', () => {
        it('should handle objects with empty string keys', ({ expect }) => {
            const input = {
                '': 'empty',
                'a': 1,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('=empty&a=1');
        });

        it('should handle objects with special characters in keys', ({ expect }) => {
            const input = {
                'key&with&amps': 2,
                'key.with.dots': 1,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toBe('key&with&amps=2&key.with.dots=1');
        });

        it('should handle values that need string conversion', ({ expect }) => {
            const input = {
                date: new Date('2024-01-01'),
                regex: /test/g,
                symbol: Symbol.for('test'),
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toContain('date=');
            expect(result).toContain('regex=');
            expect(result).toContain('symbol=');
        });

        it('should handle circular references by converting to string', ({ expect }) => {
            const circular: any = { a: 1 };
            circular.self = circular;

            // This test assumes the function doesn't handle circular references
            // and will throw or produce [object Object]
            expect(() => stringifyObjectDeterministically(circular)).toThrow();
        });

        it('should handle very large numbers', ({ expect }) => {
            const input = {
                infinity: Infinity,
                large: Number.MAX_SAFE_INTEGER,
                nan: Number.NaN,
                negInfinity: -Infinity,
                small: Number.MIN_SAFE_INTEGER,
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toContain('infinity=Infinity');
            expect(result).toContain('nan=NaN');
            expect(result).toContain('negInfinity=-Infinity');
        });
    });

    describe.concurrent('complex scenarios', () => {
        it('should handle a complex mixed structure', ({ expect }) => {
            const input = {
                metadata: {
                    timestamp: 1234567890,
                    version: '1.0.0',
                },
                user: {
                    id: 123,
                    name: 'John Doe',
                    settings: {
                        notifications: true,
                        preferences: {
                            language: 'en',
                            timezone: 'UTC',
                        },
                        theme: 'dark',
                    },
                    tags: [
                        'admin',
                        'user',
                    ],
                },
            };

            const result = stringifyObjectDeterministically(input);

            expect(result).toContain('metadata.timestamp=1234567890');
            expect(result).toContain('metadata.version=1.0.0');
            expect(result).toContain('user.id=123');
            expect(result).toContain('user.name=John Doe');
            expect(result).toContain('user.settings.notifications=true');
            expect(result).toContain('user.settings.preferences.language=en');
            expect(result).toContain('user.settings.preferences.timezone=UTC');
            expect(result).toContain('user.settings.theme=dark');
            expect(result).toContain('user.tags.0=admin');
            expect(result).toContain('user.tags.1=user');
        });

        it('should be suitable for generating consistent cache keys', ({ expect }) => {
            const apiParams1 = {
                filters: {
                    role: 'admin',
                    status: 'active',
                },
                page: 1,
                userId: 123,
            };

            const apiParams2 = {
                filters: {
                    role: 'admin',
                    status: 'active',
                },
                page: 1,
                userId: 123,
            };

            const key1 = stringifyObjectDeterministically(apiParams1);
            const key2 = stringifyObjectDeterministically(apiParams2);

            expect(key1).toBe(key2);
        });
    });
});
