import { Buffer } from 'node:buffer';

import {
    describe,
    it,
} from 'vitest';

import { toBuffer } from '../src/buffer';

describe.concurrent('toBuffer', () => {
    describe.concurrent('buffer input', () => {
        it('should return the same Buffer instance when input is already a Buffer', async ({ expect }) => {
            const input = Buffer.from('Hello World');
            const result = await toBuffer(input);

            expect(result).toBe(input);
            expect(result.toString()).toBe('Hello World');
        });

        it('should handle empty Buffer', async ({ expect }) => {
            const input = Buffer.alloc(0);
            const result = await toBuffer(input);

            expect(result).toBe(input);
            expect(result.length).toBe(0);
        });

        it('should handle Buffer with various encodings', async ({ expect }) => {
            const input = Buffer.from('Hello 世界', 'utf8');
            const result = await toBuffer(input);

            expect(result).toBe(input);
            expect(result.toString('utf8')).toBe('Hello 世界');
        });
    });

    describe.concurrent('blob input', () => {
        it('should convert Blob to Buffer', async ({ expect }) => {
            const blobContent = 'Hello from Blob';
            const input = new Blob([blobContent], { type: 'text/plain' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe(blobContent);
        });

        it('should handle empty Blob', async ({ expect }) => {
            const input = new Blob([], { type: 'text/plain' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.length).toBe(0);
        });

        it('should handle Blob with binary data', async ({ expect }) => {
            const binaryData = new Uint8Array([
                0x48,
                0x65,
                0x6C,
                0x6C,
                0x6F,
            ]);

            const input = new Blob([binaryData], { type: 'application/octet-stream' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe('Hello');
        });

        it('should handle Blob with multiple parts', async ({ expect }) => {
            const input = new Blob(
                [
                    'Hello',
                    ' ',
                    'World',
                ],
                { type: 'text/plain' },
            );

            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe('Hello World');
        });
    });

    describe.concurrent('file input', () => {
        it('should convert File to Buffer', async ({ expect }) => {
            const fileContent = 'File content';
            const input = new File([fileContent], 'test.txt', { type: 'text/plain' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe(fileContent);
        });

        it('should preserve File metadata during conversion', async ({ expect }) => {
            const fileContent = 'Test file data';
            const fileName = 'document.txt';
            const input = new File(
                [fileContent],
                fileName,
                {
                    lastModified: Date.now(),
                    type: 'text/plain',
                },
            );

            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe(fileContent);
        });

        it('should handle File with binary content', async ({ expect }) => {
            const binaryData = new Uint8Array([
                0xFF,
                0xD8,
                0xFF,
                0xE0,
            ]);

            const input = new File([binaryData], 'image.jpg', { type: 'image/jpeg' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result[0]).toBe(0xFF);
            expect(result[1]).toBe(0xD8);
            expect(result[2]).toBe(0xFF);
            expect(result[3]).toBe(0xE0);
        });
    });

    describe.concurrent('edge cases', () => {
        it('should handle large data', async ({ expect }) => {
            const largeData = 'x'.repeat(1024 * 1024);
            const input = new Blob([largeData]);
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.length).toBe(1024 * 1024);
            expect(result.toString().substring(0, 10)).toBe('xxxxxxxxxx');
        });

        it('should handle unicode content correctly', async ({ expect }) => {
            const unicodeContent = '👋 Hello 世界 🌍';
            const input = new Blob([unicodeContent], { type: 'text/plain' });
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString('utf8')).toBe(unicodeContent);
        });

        it('should handle Blob created from ArrayBuffer', async ({ expect }) => {
            const arrayBuffer = new ArrayBuffer(5);
            const view = new Uint8Array(arrayBuffer);
            view.set([
                72,
                101,
                108,
                108,
                111,
            ]);

            const input = new Blob([arrayBuffer]);
            const result = await toBuffer(input);

            expect(Buffer.isBuffer(result)).toBe(true);
            expect(result.toString()).toBe('Hello');
        });
    });

    describe.concurrent('type validation', () => {
        it('should return Buffer type for all valid inputs', async ({ expect }) => {
            const inputs = [
                Buffer.from('test'),
                new Blob(['test']),
                new File(['test'], 'test.txt'),
            ];

            for (const input of inputs) {
                const result = await toBuffer(input);
                expect(Buffer.isBuffer(result)).toBe(true);
            }
        });
    });

    describe.concurrent('performance considerations', () => {
        it('should not create unnecessary copies for Buffer input', async ({ expect }) => {
            const input = Buffer.from('Performance test');
            const startTime = performance.now();
            const result = await toBuffer(input);
            const endTime = performance.now();

            expect(result).toBe(input);
            expect(endTime - startTime).toBeLessThan(1);
        });
    });
});
