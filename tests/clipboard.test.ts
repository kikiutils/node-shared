/**
 * @vitest-environment jsdom
 */

import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import {
    copyBlobToClipboard,
    copyTextToClipboard,
} from '../src/clipboard';

class TestClipboardItem {
    readonly data: Record<string, Blob>;
    readonly options?: ClipboardItemOptions;

    constructor(data: Record<string, Blob>, options?: ClipboardItemOptions) {
        this.data = data;
        this.options = options;
    }
}

beforeEach(() => {
    vi.stubGlobal('ClipboardItem', TestClipboardItem);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('copyTextToClipboard', () => {
    it('should copy text with navigator clipboard', async ({ expect }) => {
        const writeText = vi.fn(() => Promise.resolve());
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText },
        });

        await expect(copyTextToClipboard('hello')).resolves.toEqual({ ok: true });
        expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('should return the thrown error when text copy fails', async ({ expect }) => {
        const error = new Error('denied');
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { writeText: vi.fn(() => Promise.reject(error)) },
        });

        await expect(copyTextToClipboard('hello')).resolves.toEqual({
            error,
            ok: false,
        });
    });
});

describe('copyBlobToClipboard', () => {
    it('should copy a blob with ClipboardItem', async ({ expect }) => {
        const write = vi.fn((items: TestClipboardItem[]) => Promise.resolve(items));
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { write },
        });
        const blob = new Blob(['hello'], { type: 'text/plain' });
        const options = { presentationStyle: 'inline' } as ClipboardItemOptions;

        await expect(copyBlobToClipboard(blob, options)).resolves.toEqual({ ok: true });
        expect(write).toHaveBeenCalledTimes(1);
        const items = write.mock.calls[0]![0];
        expect(items).toHaveLength(1);
        expect(items[0]).toBeInstanceOf(TestClipboardItem);
        expect((items[0] as TestClipboardItem).data).toEqual({ 'text/plain': blob });
        expect((items[0] as TestClipboardItem).options).toBe(options);
    });

    it('should return an unsupported error when clipboard.write is unavailable', async ({ expect }) => {
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: {},
        });

        const result = await copyBlobToClipboard(new Blob(['hello'], { type: 'text/plain' }));

        expect(result.ok).toBe(false);
        expect(result).toHaveProperty('error', expect.any(Error));
    });

    it('should return the thrown error when blob copy fails', async ({ expect }) => {
        const error = new Error('denied');
        Object.defineProperty(navigator, 'clipboard', {
            configurable: true,
            value: { write: vi.fn(() => Promise.reject(error)) },
        });

        await expect(copyBlobToClipboard(new Blob(['hello'], { type: 'text/plain' }))).resolves.toEqual({
            error,
            ok: false,
        });
    });
});
