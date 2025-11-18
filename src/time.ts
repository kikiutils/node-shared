export function delay(ms: number, signal?: AbortSignal) {
    return new Promise((resolve) => {
        const timeout = setTimeout(resolve, ms);
        if (signal) {
            signal.addEventListener(
                'abort',
                () => {
                    clearTimeout(timeout);
                    resolve(undefined);
                },
            );
        }
    });
}
