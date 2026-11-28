import {
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';
import {
    ref,
    shallowRef,
} from 'vue';

import { usePreserveScroll } from '../src/vue';

// Hoisted state is required by the module mock factories.
const lifecycleCallbacks = vi.hoisted(() => ({
    activated: [] as Array<() => void>,
    beforeRouteLeave: [] as Array<() => void>,
}));

vi.mock(
    'vue',
    async (importActual) => {
        const actual = await importActual<typeof import('vue')>();
        return {
            ...actual,
            onActivated: (callback: () => void) => lifecycleCallbacks.activated.push(callback),
        };
    },
);

vi.mock(
    'vue-router',
    () => ({ onBeforeRouteLeave: (callback: () => void) => lifecycleCallbacks.beforeRouteLeave.push(callback) }),
);

beforeEach(() => {
    lifecycleCallbacks.activated.length = 0;
    lifecycleCallbacks.beforeRouteLeave.length = 0;
});

describe('usePreserveScroll', () => {
    it('should save scroll on route leave and restore it on activation', ({ expect }) => {
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
        };

        // Only scroll offsets are consumed; shallowRef preserves the fixture identity.
        const containerRef = shallowRef(element as HTMLElement);

        usePreserveScroll(containerRef);

        expect(lifecycleCallbacks.activated).toHaveLength(1);
        expect(lifecycleCallbacks.beforeRouteLeave).toHaveLength(1);

        lifecycleCallbacks.beforeRouteLeave[0]!();
        element.scrollLeft = 0;
        element.scrollTop = 0;
        lifecycleCallbacks.activated[0]!();

        expect(element.scrollLeft).toBe(12);
        expect(element.scrollTop).toBe(34);
    });

    it('should tolerate a missing container while saving and restoring scroll', ({ expect }) => {
        const containerRef = ref<HTMLElement | null>(null);

        usePreserveScroll(containerRef);

        lifecycleCallbacks.beforeRouteLeave[0]!();
        lifecycleCallbacks.activated[0]!();

        // Saving with no element resets the offsets used by a later activation.
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
        };

        containerRef.value = element as HTMLElement;
        lifecycleCallbacks.activated[0]!();

        expect(containerRef.value.scrollLeft).toBe(0);
        expect(containerRef.value.scrollTop).toBe(0);
    });
});
