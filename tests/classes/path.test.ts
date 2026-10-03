import type { Buffer } from 'node:buffer';
import { constants } from 'node:fs';
import type {
    BigIntStats,
    Dirent,
    StatOptions,
    Stats,
} from 'node:fs';
import {
    mkdtemp,
    rm,
} from 'node:fs/promises';
import * as fsp from 'node:fs/promises';
import { tmpdir } from 'node:os';
import {
    basename,
    dirname,
    extname,
    join,
    parse,
    resolve,
    toNamespacedPath,
} from 'node:path';
import { inspect } from 'node:util';

import {
    afterEach,
    beforeEach,
    describe,
    expectTypeOf,
    it,
    vi,
} from 'vitest';

import { Path } from '../../src/classes/path';

vi.mock('node:fs/promises', { spy: true });

describe('class Path', () => {
    describe('path operations', () => {
        it('should preserve path text through string coercion, serialization, and inspection', ({ expect }) => {
            const expected = join('/tmp', 'foo', 'bar.txt');
            const path = new Path('/tmp', 'foo', 'bar.txt');

            expect(path.value).toBe(expected);
            expect(path.toString()).toBe(expected);
            expect(`${path}`).toBe(expected);
            expect(path.toJSON()).toBe(expected);
            expect(inspect(path)).toBe(expected);
            expect(() => Number(path)).toThrow(TypeError);
        });

        it('should expose path components using the current platform semantics', ({ expect }) => {
            const text = join('/tmp', 'foo', 'bar.txt');
            const path = new Path(text);

            expect(path.basename()).toBe(basename(text));
            expect(path.basename('.txt')).toBe('bar');
            expect(path.dirname().value).toBe(dirname(text));
            expect(path.parent.value).toBe(dirname(text));
            expect(path.extname()).toBe(extname(text));
            expect(path.parse()).toEqual(parse(text));
            expect(new Path(resolve('src')).isAbsolute()).toBe(true);
            expect(new Path('relative').isAbsolute()).toBe(false);
        });

        it('should return independent Path instances from path transformations', ({ expect }) => {
            const original = new Path('/tmp', 'foo');
            const child = original.join('bar.txt');

            expect(child).toBeInstanceOf(Path);
            expect(child).not.toBe(original);
            expect(child.value).toBe(join('/tmp', 'foo', 'bar.txt'));
            expect(original.relative(child).value).toBe('bar.txt');
            expect(new Path('/tmp', 'foo', '..', 'bar').normalize().value).toBe(join('/tmp', 'bar'));
            expect(new Path('src').resolve().value).toBe(resolve('src'));
            expect(Path.resolve('src').value).toBe(resolve('src'));
            expect(
                Path.format({
                    dir: join('/tmp', 'foo'),
                    ext: '.txt',
                    name: 'bar',
                }).value,
            ).toBe(join('/tmp', 'foo', 'bar.txt'));

            expect(original.value).toBe(join('/tmp', 'foo'));
        });

        it('should return the current platform namespace string without changing the instance', ({ expect }) => {
            const text = resolve('src');
            const path = new Path(text);

            expect(path.toNamespacedPath()).toBe(toNamespacedPath(text));
            expect(path.value).toBe(text);
        });

        it('should accept Path instances as constructor and join inputs', ({ expect }) => {
            const base = new Path('/tmp');
            const child = new Path('child');

            expect(new Path(base, child).value).toBe(join('/tmp', 'child'));
            expect(base.join(child, 'file.txt').value).toBe(join('/tmp', 'child', 'file.txt'));
        });
    });

    describe('file system operations', () => {
        let tempDir: string;
        let tempPath: Path;

        beforeEach(async () => {
            tempDir = await mkdtemp(join(tmpdir(), 'kikiutils-path-'));
            tempPath = new Path(tempDir);
        });

        afterEach(async () => {
            vi.resetAllMocks();
            await rm(
                tempDir,
                {
                    force: true,
                    recursive: true,
                },
            );
        });

        it('should write, append, read, and open the stored file', async ({ expect }) => {
            const file = tempPath.join('file.txt');

            await file.writeFile('hello');
            await file.appendFile(' world');

            await expect(file.access(constants.R_OK)).resolves.toBeUndefined();
            await expect(file.readFile('utf8')).resolves.toBe('hello world');
            const handle = await file.open('r');
            try {
                expect(await handle.readFile('utf8')).toBe('hello world');
            } finally {
                await handle.close();
            }
        });

        it('should copy, truncate, and rename a file without changing the Path value', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            const copy = tempPath.join('copy.txt');
            const renamed = tempPath.join('renamed.txt');
            await file.writeFile('hello world');

            await file.copyFile(copy.value);
            await copy.truncate(5);
            await copy.rename(renamed);

            await expect(file.readFile('utf8')).resolves.toBe('hello world');
            await expect(renamed.readFile('utf8')).resolves.toBe('hello');
            await expect(copy.stat()).rejects.toMatchObject({ code: 'ENOENT' });
            expect(copy.value).toBe(tempPath.join('copy.txt').value);
        });

        it('should remove files and empty directories through their stored paths', async ({ expect }) => {
            const directory = tempPath.join('nested');
            const unlinked = directory.join('unlinked.txt');
            const removed = directory.join('removed.txt');
            await directory.mkdir();
            await unlinked.writeFile('first');
            await removed.writeFile('second');

            await unlinked.unlink();
            await removed.rm();
            expect(await directory.readdir()).toEqual([]);
            await directory.rmdir();

            await expect(directory.stat()).rejects.toMatchObject({ code: 'ENOENT' });
        });

        it('should forward permission and ownership changes without requiring host privileges', async ({ expect }) => {
            const chmod = vi.mocked(fsp.chmod).mockResolvedValue(undefined);
            const chown = vi.mocked(fsp.chown).mockResolvedValue(undefined);

            await tempPath.chmod(0o600);
            await tempPath.chown(1000, 1000);

            expect(chmod).toHaveBeenCalledExactlyOnceWith(tempPath.value, 0o600);
            expect(chown).toHaveBeenCalledExactlyOnceWith(tempPath.value, 1000, 1000);
        });

        it('should infer and return entries for each readdir option', async ({ expect }) => {
            await tempPath.join('entry.txt').writeFile('hello');

            const names = await tempPath.readdir('utf8');
            expectTypeOf(names).toEqualTypeOf<string[]>();
            expect(names).toEqual(['entry.txt']);

            const buffers = await tempPath.readdir('buffer');
            expectTypeOf(buffers).toEqualTypeOf<Buffer[]>();
            expect(buffers.map((entry) => entry.toString())).toEqual(['entry.txt']);

            const entries = await tempPath.readdir({ withFileTypes: true });
            expectTypeOf(entries).toEqualTypeOf<Dirent[]>();
            expect(entries.map((entry) => entry.name)).toEqual(['entry.txt']);
            expect(entries[0]?.isFile()).toBe(true);

            const bufferEntries = await tempPath.readdir({
                encoding: 'buffer',
                withFileTypes: true,
            });

            expectTypeOf(bufferEntries).toEqualTypeOf<Dirent<Buffer>[]>();
            expect(bufferEntries.map((entry) => entry.name.toString())).toEqual(['entry.txt']);
        });

        it('should create a non-recursive directory without returning a path', async ({ expect }) => {
            await expect(tempPath.join('plain').mkdir()).resolves.toBeUndefined();
        });

        it('should return the created directory or undefined for recursive mkdir', async ({ expect }) => {
            const directory = tempPath.join('recursive');
            const created = await directory.mkdir({ recursive: true });
            expectTypeOf(created).toEqualTypeOf<string | undefined>();
            expect(created).toBe(directory.toString());

            const existing = await directory.mkdir({ recursive: true });
            expectTypeOf(existing).toEqualTypeOf<string | undefined>();
            expect(existing).toBeUndefined();
        });

        it('should infer stat metadata types when missing paths reject', async ({ expect }) => {
            const stats = await tempPath.stat();
            expectTypeOf(stats).toEqualTypeOf<Stats>();
            expect(stats.isDirectory()).toBe(true);

            const bigintStats = await tempPath.stat({ bigint: true });
            expectTypeOf(bigintStats).toEqualTypeOf<BigIntStats>();
            expect(typeof bigintStats.size).toBe('bigint');

            const options: StatOptions & { throwIfNoEntry: true } = { throwIfNoEntry: true };
            const metadata = await tempPath.stat(options);
            expectTypeOf(metadata).toEqualTypeOf<BigIntStats | Stats>();
            expect(metadata.isDirectory()).toBe(true);

            const missing = tempPath.join('missing');
            await expect(missing.stat()).rejects.toMatchObject({ code: 'ENOENT' });
            await expect(missing.stat({ throwIfNoEntry: true })).rejects.toMatchObject({ code: 'ENOENT' });
        });

        it('should suppress ENOENT on runtimes without native throwIfNoEntry support', async ({ expect }) => {
            const error = Object.assign(new Error('Missing path'), { code: 'ENOENT' });
            const stat = vi.mocked(fsp.stat).mockRejectedValue(error);

            await expect(tempPath.stat({ throwIfNoEntry: false })).resolves.toBeUndefined();
            await expect(
                tempPath.stat({
                    bigint: true,
                    throwIfNoEntry: false,
                }),
            ).resolves.toBeUndefined();

            expect(stat).toHaveBeenLastCalledWith(
                tempPath.toString(),
                {
                    bigint: true,
                    throwIfNoEntry: false,
                },
            );

            await expect(tempPath.stat()).rejects.toBe(error);
            await expect(tempPath.stat({ throwIfNoEntry: true })).rejects.toBe(error);
        });

        it('should preserve other stat errors even when throwIfNoEntry is false', async ({ expect }) => {
            const error = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
            vi.mocked(fsp.stat).mockRejectedValue(error);

            await expect(tempPath.stat({ throwIfNoEntry: false })).rejects.toBe(error);
        });

        it('should infer optional stat metadata and return undefined for missing paths', async ({ expect }) => {
            const stats = await tempPath.stat({ throwIfNoEntry: false });
            expectTypeOf(stats).toEqualTypeOf<Stats | undefined>();
            expect(stats?.isDirectory()).toBe(true);

            const bigintStats = await tempPath.stat({
                bigint: true,
                throwIfNoEntry: false,
            });

            expectTypeOf(bigintStats).toEqualTypeOf<BigIntStats | undefined>();
            expect(typeof bigintStats?.size).toBe('bigint');

            const missing = tempPath.join('missing');
            await expect(missing.stat({ throwIfNoEntry: false })).resolves.toBeUndefined();
            await expect(
                missing.stat({
                    bigint: true,
                    throwIfNoEntry: false,
                }),
            ).resolves.toBeUndefined();

            const options: StatOptions = { throwIfNoEntry: false };
            const metadata = await missing.stat(options);
            expectTypeOf(metadata).toEqualTypeOf<BigIntStats | Stats | undefined>();
            expect(metadata).toBeUndefined();
        });
    });
});
