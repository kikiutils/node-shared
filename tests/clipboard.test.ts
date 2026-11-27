// @vitest-environment jsdom

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

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

class TestClipboardItem {
    // Public instance properties
    readonly data: Record<string, Blob>;
    readonly options?: ClipboardItemOptions;

    // Constructor
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
    if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
    else Reflect.deleteProperty(navigator, 'clipboard');
});

describe('copyBlobToClipboard', () => {
    it('should copy a blob with ClipboardItem', async ({ expect }) => {
        const write = vi.fn(async (items: TestClipboardItem[]) => items);
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: { write },
            },
        );

        const blob = new Blob(['hello'], { type: 'text/plain' });
        const options = { presentationStyle: 'inline' } as ClipboardItemOptions;

        await expect(copyBlobToClipboard(blob, options)).resolves.toBe(true);
        expect(write).toHaveBeenCalledTimes(1);
        const items = write.mock.calls[0]![0];

        expect(items).toHaveLength(1);
        expect(items[0]).toBeInstanceOf(TestClipboardItem);
        expect(items[0]!.data).toEqual({ 'text/plain': blob });
        expect(items[0]!.options).toBe(options);
    });

    it('should resolve to false when clipboard.write is unavailable', async ({ expect }) => {
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: {},
            },
        );

        await expect(copyBlobToClipboard(new Blob(['hello'], { type: 'text/plain' }))).resolves.toBe(false);
    });

    it('should resolve to false without writing when ClipboardItem construction fails', async ({ expect }) => {
        const error = new Error('Unsupported format');
        const write = vi.fn();
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: { write },
            },
        );

        vi.stubGlobal(
            'ClipboardItem',
            // eslint-disable-next-line prefer-arrow-callback -- ClipboardItem must be constructible.
            function UnsupportedClipboardItem() {
                throw error;
            },
        );

        await expect(copyBlobToClipboard(new Blob(['hello']))).resolves.toBe(false);

        expect(write).not.toHaveBeenCalled();
    });

    it('should resolve to false when blob copy fails', async ({ expect }) => {
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: {
                    write: vi.fn(async () => {
                        throw new Error('denied');
                    }),
                },
            },
        );

        await expect(copyBlobToClipboard(new Blob(['hello'], { type: 'text/plain' }))).resolves.toBe(false);
    });
});

describe('copyTextToClipboard', () => {
    it('should copy text with navigator clipboard', async ({ expect }) => {
        const writeText = vi.fn(async () => undefined);
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: { writeText },
            },
        );

        await expect(copyTextToClipboard('hello')).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith('hello');
    });

    it('should resolve to false when the clipboard API is unavailable', async ({ expect }) => {
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: undefined,
            },
        );

        await expect(copyTextToClipboard('hello')).resolves.toBe(false);
    });

    it('should resolve to false when text copy fails', async ({ expect }) => {
        Object.defineProperty(
            navigator,
            'clipboard',
            {
                configurable: true,
                value: {
                    writeText: vi.fn(async () => {
                        throw new Error('denied');
                    }),
                },
            },
        );

        await expect(copyTextToClipboard('hello')).resolves.toBe(false);
    });
});
