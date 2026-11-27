import type { Buffer } from 'node:buffer';
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
import { pathToFileURL } from 'node:url';
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

async function collect<T>(iterator: AsyncIterable<T>) {
    const values: T[] = [];
    for await (const value of iterator) values.push(value);
    return values;
}

describe('class Path', () => {
    describe('path operations', () => {
        it('should preserve path text through string coercion, serialization, and inspection', ({ expect }) => {
            const expected = join('/tmp', 'foo', 'bar.txt');
            const path = new Path('/tmp', 'foo', 'bar.txt');

            expect(path.value).toBe(expected);
            expect(path.toString()).toBe(expected);
            expect(String(path)).toBe(expected);
            expect(path.toJSON()).toBe(expected);
            expect(inspect(path)).toBe(expected);
            expect(() => Number(path)).toThrow(TypeError);
        });

        it('should expose path components using the current platform semantics', ({ expect }) => {
            const text = join('/tmp', 'foo', 'bar.tar.gz');
            const path = new Path(text);

            expect(path.basename()).toBe(basename(text));
            expect(path.basename('.gz')).toBe('bar.tar');
            expect(path.dirname().value).toBe(dirname(text));
            expect(path.parent.value).toBe(dirname(text));
            expect(path.extname()).toBe(extname(text));
            expect(path.stem).toBe('bar.tar');
            expect(new Path('/tmp', '.env').stem).toBe('.env');
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
            expect(new Path(resolve('src')).toNamespacedPath().value).toBe(toNamespacedPath(resolve('src')));
            expect(
                Path.format({
                    dir: join('/tmp', 'foo'),
                    ext: '.txt',
                    name: 'bar',
                }).value,
            ).toBe(join('/tmp', 'foo', 'bar.txt'));

            expect(original.value).toBe(join('/tmp', 'foo'));
        });

        it.for([
            {
                expected: String.raw`\\?\C:\foo\bar`,
                input: String.raw`C:\foo\bar`,
            },
            {
                expected: String.raw`\\?\UNC\server\share\dir`,
                input: String.raw`\\server\share\dir`,
            },
        ])(
            'should preserve the Windows namespace prefix of $input',
            async (
                {
                    expected,
                    input,
                },
                { expect },
            ) => {
                vi.resetModules();
                vi.doMock('node:path', async () => (await vi.importActual<typeof import('node:path')>('node:path')).win32);
                try {
                    const { Path: WindowsPath } = await import('../../src/classes/path');
                    const namespaced = new WindowsPath(input).toNamespacedPath();

                    expect(namespaced).toBeInstanceOf(WindowsPath);
                    expect(namespaced.value).toBe(expected);
                    expect(namespaced.join('file.txt').value).toBe(`${expected}\\file.txt`);
                } finally {
                    vi.doUnmock('node:path');
                    vi.resetModules();
                }
            },
        );

        it('should accept Path instances and file URLs as path inputs', ({ expect }) => {
            const base = new Path(resolve('/tmp'));
            const url = pathToFileURL(base.join('child').value);

            expect(new Path(base, new Path('child')).value).toBe(join(base.value, 'child'));
            expect(base.join(new Path('child'), 'file.txt').value).toBe(join(base.value, 'child', 'file.txt'));
            expect(new Path(url).value).toBe(base.join('child').value);
            expect(new Path(url, 'file.txt').value).toBe(base.join('child', 'file.txt').value);
            expect(base.relative(url).value).toBe('child');
        });

        it('should replace the extension or final component', ({ expect }) => {
            const path = new Path('/tmp', 'foo', 'bar.tar.gz');

            expect(path.withExtension('.zst').value).toBe(join('/tmp', 'foo', 'bar.tar.zst'));
            expect(path.withExtension('').value).toBe(join('/tmp', 'foo', 'bar.tar'));
            expect(new Path('/tmp', '.env').withExtension('.local').value).toBe(join('/tmp', '.env.local'));
            expect(new Path('bar.txt').withExtension('.md').value).toBe('bar.md');
            expect(path.withName('baz.txt').value).toBe(join('/tmp', 'foo', 'baz.txt'));
            expect(new Path('bar.txt').withName('baz.txt').value).toBe('baz.txt');
            expect(path.value).toBe(join('/tmp', 'foo', 'bar.tar.gz'));
        });

        it.for([
            'zst',
            '.',
            '.a/b',
        ])(
            'should reject the invalid extension %j',
            (extension, { expect }) => {
                expect(() => new Path('/tmp', 'bar.txt').withExtension(extension)).toThrow(TypeError);
            },
        );

        it.for([
            '',
            '.',
            '..',
            'a/b',
        ])(
            'should reject the invalid name %j',
            (name, { expect }) => {
                expect(() => new Path('/tmp', 'bar.txt').withName(name)).toThrow(TypeError);
            },
        );

        it('should keep Windows drive-relative paths drive-relative when replacing the final component', async ({ expect }) => {
            vi.resetModules();
            vi.doMock('node:path', async () => (await vi.importActual<typeof import('node:path')>('node:path')).win32);
            try {
                const { Path: WindowsPath } = await import('../../src/classes/path');
                const path = new WindowsPath('C:foo.txt');

                expect(path.withExtension('.md').value).toBe('C:foo.md');
                expect(path.withName('bar.txt').value).toBe('C:bar.txt');
            } finally {
                vi.doUnmock('node:path');
                vi.resetModules();
            }
        });

        it('should reject replacing the final component of a root path', ({ expect }) => {
            const root = new Path(parse(resolve('/')).root);

            expect(() => root.withName('bar.txt')).toThrow(TypeError);
            expect(() => root.withExtension('.txt')).toThrow(TypeError);
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

        it('should infer readFile results for each encoding option', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            await file.writeFile('hello');

            const text = await file.readFile('utf8');

            expectTypeOf(text).toEqualTypeOf<string>();
            expect(text).toBe('hello');

            const buffer = await file.readFile();

            expectTypeOf(buffer).toEqualTypeOf<Buffer>();
            expect(buffer.toString()).toBe('hello');
        });

        it('should accept Path and file URL destinations without changing the source Path', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            const copy = tempPath.join('copy.txt');
            const renamed = tempPath.join('renamed.txt');
            await file.writeFile('hello');

            await file.copyFile(copy);
            await copy.rename(pathToFileURL(renamed.value));

            await expect(file.readFile('utf8')).resolves.toBe('hello');
            await expect(renamed.readFile('utf8')).resolves.toBe('hello');
            await expect(copy.exists()).resolves.toBe(false);
            expect(copy.value).toBe(tempPath.join('copy.txt').value);
        });

        it('should copy a directory tree to a Path destination', async ({ expect }) => {
            const source = tempPath.join('source');
            const destination = tempPath.join('destination');
            await source.join('nested').mkdir({ recursive: true });
            await source.join('nested', 'file.txt').writeFile('hello');

            await source.cp(destination, { recursive: true });

            await expect(destination.join('nested', 'file.txt').readFile('utf8')).resolves.toBe('hello');
        });

        it('should create a symlink at the stored path that points to the target', async ({ expect }) => {
            const target = tempPath.join('target.txt');
            const link = tempPath.join('link');
            await target.writeFile('hello');

            await link.symlink(target);

            await expect(link.readlink()).resolves.toBe(target.value);
            await expect(link.realpath()).resolves.toBe(await target.realpath());
            await expect(link.readFile('utf8')).resolves.toBe('hello');
        });

        it('should keep relative symlink targets relative to the link directory', async ({ expect }) => {
            const directory = tempPath.join('directory');
            const link = directory.join('link');
            await directory.mkdir();
            await tempPath.join('target.txt').writeFile('hello');

            await link.symlink(join('..', 'target.txt'));

            await expect(link.readlink()).resolves.toBe(join('..', 'target.txt'));
            await expect(link.readFile('utf8')).resolves.toBe('hello');
        });

        it('should infer readlink and realpath results for each encoding option', async ({ expect }) => {
            const link = tempPath.join('link');
            await link.symlink(tempPath.join('target'));

            const text = await link.readlink();

            expectTypeOf(text).toEqualTypeOf<string>();

            const buffer = await link.readlink('buffer');

            expectTypeOf(buffer).toEqualTypeOf<Buffer>();
            expect(buffer.toString()).toBe(text);

            const asBuffer = buffer.length < 0;

            expectTypeOf(link.readlink(asBuffer ? 'buffer' : 'utf8')).toEqualTypeOf<Promise<Buffer | string>>();
            expectTypeOf(tempPath.realpath(asBuffer ? { encoding: 'buffer' } : 'utf8')).toEqualTypeOf<Promise<Buffer | string>>();

            const realpath = await tempPath.realpath({ encoding: 'buffer' });

            expectTypeOf(realpath).toEqualTypeOf<Buffer>();
            expect(realpath.toString()).toBe(await tempPath.realpath());
        });

        it('should report existence and entry types without rejecting for missing paths', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            const fileLink = tempPath.join('file-link');
            const brokenLink = tempPath.join('broken-link');
            const missing = tempPath.join('missing');
            await file.writeFile('hello');
            await fileLink.symlink(file);
            await brokenLink.symlink(missing);

            const results = await Promise.all(
                [
                    tempPath,
                    file,
                    fileLink,
                    brokenLink,
                    missing,
                ].map(async (path) => [
                    await path.exists(),
                    await path.isDirectory(),
                    await path.isFile(),
                    await path.isSymbolicLink(),
                ]),
            );

            expect(results).toEqual([
                [
                    true,
                    true,
                    false,
                    false,
                ],
                [
                    true,
                    false,
                    true,
                    false,
                ],
                [
                    true,
                    false,
                    true,
                    true,
                ],
                [
                    false,
                    false,
                    false,
                    true,
                ],
                [
                    false,
                    false,
                    false,
                    false,
                ],
            ]);
        });

        it('should treat a child of a regular file as missing', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            await file.writeFile('hello');
            const child = file.join('child');

            await expect(child.exists()).resolves.toBe(false);
            await expect(child.isFile()).resolves.toBe(false);
            await expect(child.isSymbolicLink()).resolves.toBe(false);
            await expect(child.stat({ throwIfNoEntry: false })).resolves.toBeUndefined();
        });

        it('should reject existence checks for errors other than missing paths', async ({ expect }) => {
            const error = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
            vi.mocked(fsp.stat).mockRejectedValue(error);
            vi.mocked(fsp.lstat).mockRejectedValue(error);

            await expect(tempPath.exists()).rejects.toBe(error);
            await expect(tempPath.isDirectory()).rejects.toBe(error);
            await expect(tempPath.isSymbolicLink()).rejects.toBe(error);
        });

        it('should accept a string encoding for watch', async ({ expect }) => {
            const file = tempPath.join('file.txt');
            await file.writeFile('hello');
            const watcher = file.watch('utf8');

            expectTypeOf(watcher).toEqualTypeOf<NodeJS.AsyncIterator<fsp.FileChangeInfo<string>>>();
            const next = watcher.next();
            await file.appendFile(' world');

            expect((await next).value?.filename).toBe('file.txt');
            await watcher.return?.();
        });

        it('should glob relative to the stored path and infer entry types', async ({ expect }) => {
            await tempPath.join('nested').mkdir();
            await tempPath.join('root.txt').writeFile('');
            await tempPath.join('nested', 'child.txt').writeFile('');
            await tempPath.join('nested', 'skip.md').writeFile('');

            const paths = tempPath.glob('**/*.txt');

            expectTypeOf(paths).toEqualTypeOf<NodeJS.AsyncIterator<string>>();
            expect((await collect(paths)).sort()).toEqual([
                join('nested', 'child.txt'),
                'root.txt',
            ]);

            const entries = tempPath.glob('*.txt', { withFileTypes: true });

            expectTypeOf(entries).toEqualTypeOf<NodeJS.AsyncIterator<Dirent>>();
            expect((await collect(entries)).map((entry) => entry.name)).toEqual(['root.txt']);
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

            const bufferEntries = await tempPath.readdir({
                encoding: 'buffer',
                withFileTypes: true,
            });

            expectTypeOf(bufferEntries).toEqualTypeOf<Array<Dirent<Buffer>>>();
            expect(bufferEntries.map((entry) => entry.name.toString())).toEqual(['entry.txt']);
        });

        it('should infer mkdir results for recursive and nonrecursive modes', async ({ expect }) => {
            const plain = await tempPath.join('plain').mkdir();

            expectTypeOf(plain).toEqualTypeOf<void>();
            expect(plain).toBeUndefined();

            const directory = tempPath.join('recursive');
            const created = await directory.mkdir({ recursive: true });

            expectTypeOf(created).toEqualTypeOf<string | undefined>();
            expect(toNamespacedPath(created!)).toBe(toNamespacedPath(directory.value));
            await expect(directory.mkdir({ recursive: true })).resolves.toBeUndefined();
        });

        it('should read symlink metadata without following the link', async ({ expect }) => {
            const target = tempPath.join('target');
            const link = tempPath.join('link');
            await target.mkdir();
            await link.symlink(target);

            const stats = await link.lstat();

            expectTypeOf(stats).toEqualTypeOf<Stats>();
            expect(stats.isSymbolicLink()).toBe(true);
            expect((await link.stat()).isDirectory()).toBe(true);

            const missing = await tempPath.join('missing').lstat({ throwIfNoEntry: false });

            expectTypeOf(missing).toEqualTypeOf<Stats | undefined>();
            expect(missing).toBeUndefined();
            await expect(tempPath.join('missing').lstat()).rejects.toMatchObject({ code: 'ENOENT' });
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

        it('should resolve undefined only for ENOENT when throwIfNoEntry is false', async ({ expect }) => {
            const missingError = Object.assign(new Error('Missing path'), { code: 'ENOENT' });
            const deniedError = Object.assign(new Error('Permission denied'), { code: 'EACCES' });
            vi.mocked(fsp.stat).mockRejectedValue(missingError);

            await expect(tempPath.stat({ throwIfNoEntry: false })).resolves.toBeUndefined();
            await expect(tempPath.stat()).rejects.toBe(missingError);
            await expect(tempPath.stat({ throwIfNoEntry: true })).rejects.toBe(missingError);

            vi.mocked(fsp.stat).mockRejectedValue(deniedError);

            await expect(tempPath.stat({ throwIfNoEntry: false })).rejects.toBe(deniedError);
        });
    });
});
