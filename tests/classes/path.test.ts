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
import { tmpdir } from 'node:os';
import {
    dirname,
    extname,
    join,
    parse,
    resolve,
} from 'node:path';
import { inspect } from 'node:util';

import {
    afterEach,
    beforeEach,
    describe,
    expectTypeOf,
    it,
} from 'vitest';

import { Path } from '../../src/classes/path';

let tempDir: string;
let tempPath: Path;

beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'kikiutils-path-'));
    tempPath = new Path(tempDir);
});

afterEach(async () => {
    await rm(tempDir, {
        force: true,
        recursive: true,
    });
});

describe.concurrent('path path operations', () => {
    it('should wrap node:path operations immutably', ({ expect }) => {
        const path = new Path('/tmp', 'foo', 'bar.txt');

        expect(path.value).toBe('/tmp/foo/bar.txt');
        expect(path.toString()).toBe('/tmp/foo/bar.txt');
        expect(`${path}`).toBe('/tmp/foo/bar.txt');
        expect(path.toJSON()).toBe('/tmp/foo/bar.txt');
        expect(inspect(path)).toBe('/tmp/foo/bar.txt');
        expect(() => Number(path)).toThrow(TypeError);
        expect(path.basename()).toBe('bar.txt');
        expect(path.basename('.txt')).toBe('bar');
        expect(path.dirname().toString()).toBe(dirname('/tmp/foo/bar.txt'));
        expect(path.parent.toString()).toBe(dirname('/tmp/foo/bar.txt'));
        expect(path.extname()).toBe(extname('/tmp/foo/bar.txt'));
        expect(path.isAbsolute()).toBe(true);
        expect(new Path('/tmp/foo/../bar').normalize().toString()).toBe('/tmp/bar');
        expect(path.join('baz').toString()).toBe('/tmp/foo/bar.txt/baz');
        expect(path.parse()).toEqual(parse('/tmp/foo/bar.txt'));
        expect(new Path('/tmp/foo').relative('/tmp/foo/bar/baz.txt').toString()).toBe('bar/baz.txt');
        expect(new Path('src').resolve().toString()).toBe(resolve('src'));
        expect(Path.resolve('src').toString()).toBe(resolve('src'));
        expect(
            Path
                .format({
                    dir: '/tmp/foo',
                    ext: '.txt',
                    name: 'bar',
                })
                .toString(),
        ).toBe('/tmp/foo/bar.txt');

        expect(path.toNamespacedPath()).toBe(path.toString());
        expect(path.toString()).toBe('/tmp/foo/bar.txt');
    });

    it('should accept Path instances as path-like constructor and join inputs', ({ expect }) => {
        const base = new Path('/tmp');
        const child = new Path('child');

        expect(new Path(base, child).toString()).toBe('/tmp/child');
        expect(base.join(child, 'file.txt').toString()).toBe('/tmp/child/file.txt');
    });
});

describe('path fs promise operations', () => {
    it('should delegate common file and directory operations to fs/promises', async ({ expect }) => {
        const nestedDir = tempPath.join('nested');
        const file = nestedDir.join('file.txt');
        const copy = nestedDir.join('copy.txt');
        const renamed = nestedDir.join('renamed.txt');

        await expect(nestedDir.mkdir({ recursive: true })).resolves.toBe(nestedDir.toString());
        await expect(file.writeFile('hello')).resolves.toBeUndefined();
        await expect(file.access(constants.R_OK)).resolves.toBeUndefined();
        await expect(file.appendFile(' world')).resolves.toBeUndefined();
        await expect(file.readFile('utf8')).resolves.toBe('hello world');
        await expect(file.copyFile(copy.toString())).resolves.toBeUndefined();
        await expect(copy.readFile('utf8')).resolves.toBe('hello world');

        const handle = await file.open('r');
        await handle.close();

        const stat = await file.stat();
        expect(stat.isFile()).toBe(true);
        await expect(file.chmod(stat.mode)).resolves.toBeUndefined();
        await expect(file.chown(stat.uid, stat.gid)).resolves.toBeUndefined();
        await expect(file.truncate(5)).resolves.toBeUndefined();
        await expect(file.readFile('utf8')).resolves.toBe('hello');
        await expect(file.rename(renamed)).resolves.toBeUndefined();
        await expect(renamed.readFile('utf8')).resolves.toBe('hello');

        const entries = await nestedDir.readdir();
        expectTypeOf(entries).toEqualTypeOf<string[]>();
        expect(entries.toSorted()).toEqual([
            'copy.txt',
            'renamed.txt',
        ]);

        await expect(copy.unlink()).resolves.toBeUndefined();
        await expect(renamed.rm()).resolves.toBeUndefined();
        await expect(nestedDir.rmdir()).resolves.toBeUndefined();
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
