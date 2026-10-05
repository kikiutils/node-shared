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
            input: Uint8Array.from(jpeg),
            name: 'Uint8Array',
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
        await expect(getFileMimeType(new ArrayBuffer(8))).resolves.toBeUndefined();
        await expect(getFileMimeType(Buffer.from('plain text'))).resolves.toBeUndefined();
        await expect(getFileMimeType(new Blob(['plain text']))).resolves.toBeUndefined();
        await expect(getFileMimeType(new Blob())).resolves.toBeUndefined();
    });

    it('should preserve input-reading errors', async ({ expect }) => {
        const error = new Error('Read failed');
        const input = new Blob([jpeg]);
        const slice = new Blob([jpeg]);
        slice.arrayBuffer = () => Promise.reject(error);
        vi.spyOn(input, 'slice').mockReturnValue(slice);

        await expect(getFileMimeType(input)).rejects.toBe(error);
    });
});
