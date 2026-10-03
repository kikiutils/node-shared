import { Buffer } from 'node:buffer';

import {
    describe,
    it,
} from 'vitest';

import { toBuffer } from '../src/buffer';

describe('toBuffer', () => {
    it('should return an existing Buffer without copying it', async ({ expect }) => {
        const input = Buffer.from('Hello 世界');

        expect(await toBuffer(input)).toBe(input);
        expect(await toBuffer(Buffer.alloc(0))).toHaveLength(0);
    });

    it('should share ArrayBuffer memory in both directions', async ({ expect }) => {
        const input = new ArrayBuffer(2);
        const bytes = new Uint8Array(input);
        bytes.set([
            10,
            20,
        ]);

        const result = await toBuffer(input);

        expect(result).toEqual(Buffer.from([
            10,
            20,
        ]));

        bytes[0] = 30;
        expect(result[0]).toBe(30);
        result[1] = 40;
        expect(bytes[1]).toBe(40);
    });

    it('should preserve the offset and length of a shared Uint8Array view', async ({ expect }) => {
        const bytes = new Uint8Array([
            10,
            20,
            30,
            40,
            50,
        ]);

        const input = bytes.subarray(1, 4);

        const result = await toBuffer(input);

        expect(result).toEqual(Buffer.from([
            20,
            30,
            40,
        ]));

        bytes[1] = 60;
        expect(result[0]).toBe(60);
        result[2] = 70;
        expect(bytes[3]).toBe(70);
    });

    it.for([
        {
            expected: 'Hello 世界',
            input: new Blob([
                'Hello ',
                '世界',
            ]),
            name: 'Blob',
        },
        {
            expected: 'Hello 世界',
            input: new File(['Hello 世界'], 'test.txt'),
            name: 'File',
        },
        {
            expected: '',
            input: new Blob([]),
            name: 'empty Blob',
        },
        {
            expected: '',
            input: new ArrayBuffer(0),
            name: 'empty ArrayBuffer',
        },
        {
            expected: '',
            input: new Uint8Array(0),
            name: 'empty Uint8Array',
        },
    ])(
        'should read the complete contents of $name',
        async ({ expected, input }, { expect }) => {
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe(expected);
        },
    );

    it('should preserve binary bytes when reading a Blob', async ({ expect }) => {
        const input = new Blob([
            new Uint8Array([
                0,
                0xFF,
                0x80,
            ]),
        ]);

        expect(await toBuffer(input)).toEqual(Buffer.from([
            0,
            0xFF,
            0x80,
        ]));
    });

    it('should preserve a failure from the binary reader', async ({ expect }) => {
        const error = new Error('Read failed');
        const input = { arrayBuffer: () => Promise.reject(error) };

        // @ts-expect-error A minimal reader isolates the asynchronous error contract.
        await expect(toBuffer(input)).rejects.toBe(error);
    });

    it('should reject unsupported input', async ({ expect }) => {
        // @ts-expect-error Runtime validation must also reject inputs outside BinaryInput.
        await expect(toBuffer({})).rejects.toThrow(TypeError);
    });
});
