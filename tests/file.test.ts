import { Buffer } from 'node:buffer';
import { readFile } from 'node:fs/promises';

import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { getFileMimeType } from '../src/file';

const jpeg = await readFile(new URL('./fixtures/image.jpg', import.meta.url));
const paddedJpeg = Buffer.concat([
    Buffer.from('prefix'),
    jpeg,
    Buffer.from('suffix'),
]);

afterEach(() => {
    vi.restoreAllMocks();
});

describe('getFileMimeType', () => {
    it.for([
        {
            input: jpeg,
            name: 'Buffer',
        },
        {
            input: Uint8Array.from(jpeg).buffer,
            name: 'ArrayBuffer',
        },
        {
            input: new Uint8Array(paddedJpeg.buffer, paddedJpeg.byteOffset + 6, jpeg.length),
            name: 'offset Uint8Array',
        },
        {
            input: new Blob([jpeg]),
            name: 'Blob',
        },
        {
            input: new File([jpeg], 'wrong-extension.png', { type: 'image/png' }),
            name: 'File with misleading metadata',
        },
    ])(
        'should detect JPEG content from $name',
        async ({ input }, { expect }) => await expect(getFileMimeType(input)).resolves.toBe('image/jpeg'),
    );

    it('should return undefined for unknown content', async ({ expect }) => {
        await expect(getFileMimeType(Buffer.from('plain text'))).resolves.toBeUndefined();
        await expect(getFileMimeType(new Blob(['plain text']))).resolves.toBeUndefined();
    });
});
