import { Buffer } from 'node:buffer';

import {
    describe,
    it,
    vi,
} from 'vitest';

import type { BunRedisLikeClient } from '../../../src/storages/redis/bun-adapter';
import { createBunRedisAdapter } from '../../../src/storages/redis/bun-adapter';

function createClient(overrides: Partial<BunRedisLikeClient> = {}) {
    return {
        del: vi.fn(async () => 1),
        exists: vi.fn(async () => true),
        getBuffer: vi.fn(async () => null),
        send: vi.fn(async () => null),
        set: vi.fn(async () => 'OK'),
        setex: vi.fn(async () => 'OK' as const),
        ttl: vi.fn(async () => 60),
        ...overrides,
    } satisfies BunRedisLikeClient;
}

describe('createBunRedisAdapter', () => {
    it('should decode the hex GETDEL script result into the original bytes', async ({ expect }) => {
        const client = createClient({ send: vi.fn().mockResolvedValueOnce('00ffd8').mockResolvedValueOnce(null) });
        const adapter = createBunRedisAdapter(client);

        await expect(adapter.getBufferAndDelete('key')).resolves.toEqual(Buffer.from([
            0x00,
            0xFF,
            0xD8,
        ]));

        await expect(adapter.getBufferAndDelete('key')).resolves.toBeNull();
        expect(client.send).toHaveBeenCalledWith(
            'EVALSHA',
            [
                expect.any(String),
                '1',
                'key',
            ],
        );
    });

    it('should write with EX and NX and map a rejected NX write to null', async ({ expect }) => {
        const client = createClient({ set: vi.fn().mockResolvedValueOnce('OK').mockResolvedValueOnce(null) });
        const adapter = createBunRedisAdapter(client);
        const value = Uint8Array.of(1);

        await expect(adapter.setBufferWithTtlIfAbsent('key', 60, value)).resolves.toBe('OK');
        await expect(adapter.setBufferWithTtlIfAbsent('key', 60, value)).resolves.toBeNull();
        expect(client.set).toHaveBeenCalledWith('key', value, 'EX', '60', 'NX');
    });

    it('should pass key, value, and TTL operations through to the client', async ({ expect }) => {
        const buffer = Buffer.from([
            1,
            2,
        ]);

        const client = createClient({
            del: vi.fn(async () => 2),
            exists: vi.fn(async () => false),
            getBuffer: vi.fn().mockResolvedValueOnce(buffer).mockResolvedValueOnce(null),
            ttl: vi.fn(async () => -2),
        });

        const adapter = createBunRedisAdapter(client);

        await expect(adapter.delete('key')).resolves.toBe(2);
        await expect(adapter.has('key')).resolves.toBe(false);
        await expect(adapter.getBuffer('key')).resolves.toBe(buffer);
        await expect(adapter.getBuffer('key')).resolves.toBeNull();
        await expect(adapter.ttl('key')).resolves.toBe(-2);
        expect(client.del).toHaveBeenCalledWith('key');
        expect(client.exists).toHaveBeenCalledWith('key');
        expect(client.getBuffer).toHaveBeenCalledWith('key');
        expect(client.ttl).toHaveBeenCalledWith('key');
    });

    it('should map plain and TTL writes to the matching client commands', async ({ expect }) => {
        const client = createClient({ set: vi.fn().mockResolvedValueOnce('OK').mockResolvedValueOnce(null) });
        const adapter = createBunRedisAdapter(client);
        const value = Uint8Array.of(1);

        await expect(adapter.setBuffer('key', value)).resolves.toBe('OK');
        await expect(adapter.setBuffer('key', value)).resolves.toBeUndefined();
        expect(client.set).toHaveBeenCalledWith('key', value);

        await expect(adapter.setBufferWithTtl('key', 30, value)).resolves.toBe('OK');
        expect(client.setex).toHaveBeenCalledWith('key', 30, value);
    });
});
