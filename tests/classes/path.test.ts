import { constants } from 'node:fs';
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
        expect(Path.format({
            dir: '/tmp/foo',
            ext: '.txt',
            name: 'bar',
        }).toString()).toBe('/tmp/foo/bar.txt');
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

        const entries = await (nestedDir.readdir as unknown as () => Promise<string[]>)();
        expect(entries.toSorted()).toEqual([
            'copy.txt',
            'renamed.txt',
        ]);

        await expect(copy.unlink()).resolves.toBeUndefined();
        await expect(renamed.rm()).resolves.toBeUndefined();
        await expect(nestedDir.rmdir()).resolves.toBeUndefined();
    });

    it('should create a non-recursive directory without returning a path', async ({ expect }) => {
        await expect(tempPath.join('plain').mkdir()).resolves.toBeUndefined();
    });
});
