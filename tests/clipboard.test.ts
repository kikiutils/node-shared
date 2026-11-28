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

function setClipboard(value: unknown) {
    Object.defineProperty(
        navigator,
        'clipboard',
        {
            configurable: true,
            value,
        },
    );
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
        setClipboard({ write });

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

    it('should resolve to false when clipboard.write is unavailable or fails', async ({ expect }) => {
        const blob = new Blob(['hello'], { type: 'text/plain' });
        setClipboard({});

        await expect(copyBlobToClipboard(blob)).resolves.toBe(false);

        setClipboard({ write: vi.fn().mockRejectedValue(new Error('denied')) });

        await expect(copyBlobToClipboard(blob)).resolves.toBe(false);
    });

    it('should resolve to false without writing when ClipboardItem construction fails', async ({ expect }) => {
        const write = vi.fn();
        setClipboard({ write });
        vi.stubGlobal(
            'ClipboardItem',
            // eslint-disable-next-line prefer-arrow-callback -- ClipboardItem must be constructible.
            function UnsupportedClipboardItem() {
                throw new Error('Unsupported format');
            },
        );

        await expect(copyBlobToClipboard(new Blob(['hello']))).resolves.toBe(false);

        expect(write).not.toHaveBeenCalled();
    });
});

describe('copyTextToClipboard', () => {
    it('should copy text with navigator clipboard', async ({ expect }) => {
        const writeText = vi.fn(async () => undefined);
        setClipboard({ writeText });

        await expect(copyTextToClipboard('hello')).resolves.toBe(true);
        expect(writeText).toHaveBeenCalledWith('hello');
    });

    it.for([
        undefined,
        { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    ])(
        'should resolve to false when the clipboard API is unavailable or fails: %j',
        async (clipboard, { expect }) => {
            setClipboard(clipboard);

            await expect(copyTextToClipboard('hello')).resolves.toBe(false);
        },
    );
});
