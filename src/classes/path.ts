import { Buffer } from 'node:buffer';
import type { Abortable } from 'node:events';
import {
    createReadStream,
    createWriteStream,
} from 'node:fs';
import type * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as nodePath from 'node:path';
import { fileURLToPath } from 'node:url';

type DropFirstParameters<T extends (...args: any) => any> = Parameters<T> extends [any, ...infer R] ? R : never;

/**
 * Values accepted wherever `Path` takes a path; `file:` URL objects are converted to file system paths, while
 * `file:` strings are plain path text. Buffers must contain valid UTF-8.
 */
export type PathLike = fs.PathLike | Path;

/**
 * Options accepted by `Path.watch`, matching what Node.js validates at runtime.
 */
export type PathWatchOptions = Omit<fsp.WatchOptions, 'encoding' | 'overflow'> & {
    encoding?: BufferEncoding;
    overflow?: 'error' | 'ignore';
};

/**
 * An immutable file system path with Node.js path and file operations.
 *
 * @remarks
 * Path-composition methods return new instances and leave this instance unchanged.
 * File operations act on the stored path and forward Node.js defaults and promise rejections.
 * They do not update the stored path, including after a successful rename.
 */
export class Path {
    // Private instance properties
    readonly #value: string;

    // Constructor

    /**
     * Creates a normalized path value by joining the provided path segments.
     */
    constructor(...paths: PathLike[]) {
        this.#value = nodePath.join(...paths.map(toPathString));
    }

    // Private instance methods
    #hasSeparator(value: string) {
        return value.includes('/') || value.includes(nodePath.sep);
    }

    // Public instance accessors
    get parent() {
        return this.dirname();
    }

    /**
     * The final path component without its last extension; a leading dot does not start one, so `.env` stays whole.
     */
    get stem() {
        return nodePath.parse(this.#value).name;
    }

    get value() {
        return this.#value;
    }

    // Public static methods
    static format(pathObject: nodePath.FormatInputPathObject) {
        return new Path(nodePath.format(pathObject));
    }

    /**
     * Resolves joined path segments to an absolute path.
     *
     * @remarks
     * Inputs are joined before resolution; unlike Node.js `path.resolve`,
     * later absolute segments do not reset the path.
     */
    static resolve(...paths: PathLike[]) {
        return new Path(...paths).resolve();
    }

    // Public instance methods
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.#value;
    }

    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') throw new TypeError('Cannot convert a Path to a number');
        return this.#value;
    }

    basename(suffix?: string) {
        return nodePath.basename(this.#value, suffix);
    }

    dirname() {
        return new Path(nodePath.dirname(this.#value));
    }

    extname() {
        return nodePath.extname(this.#value);
    }

    isAbsolute() {
        return nodePath.isAbsolute(this.#value);
    }

    normalize() {
        return new Path(nodePath.normalize(this.#value));
    }

    join(...paths: PathLike[]) {
        return new Path(this.#value, ...paths);
    }

    parse() {
        return nodePath.parse(this.#value);
    }

    relative(to: PathLike) {
        return new Path(nodePath.relative(this.#value, toPathString(to)));
    }

    resolve() {
        return new Path(nodePath.resolve(this.#value));
    }

    toJSON() {
        return this.#value;
    }

    toNamespacedPath() {
        return new Path(nodePath.toNamespacedPath(this.#value));
    }

    toString() {
        return this.#value;
    }

    /**
     * Replaces the last extension of the final path component.
     *
     * @param extension - The new extension including its leading dot, or an empty string to remove the extension.
     *
     * @throws TypeError if a nonempty extension is `.`, lacks a leading dot, or contains a path separator;
     * if the resulting name is `.` or `..`; or if this path has no final component.
     */
    withExtension(extension: string) {
        if (extension && (!extension.startsWith('.') || extension === '.' || this.#hasSeparator(extension))) {
            throw new TypeError(`Invalid extension: ${extension}`);
        }

        return this.withName(`${this.stem}${extension}`);
    }

    /**
     * Replaces the final path component.
     *
     * @throws TypeError if the name is empty, `.`, `..`, or contains a path separator,
     * or if this path has no final component.
     */
    withName(name: string) {
        if (!name || name === '.' || name === '..' || this.#hasSeparator(name)) {
            throw new TypeError(`Invalid final component: ${name}`);
        }

        const parsed = nodePath.parse(this.#value);
        if (!parsed.base || parsed.base === '.' || parsed.base === '..') {
            throw new TypeError(`Path has no final component: ${this.#value}`);
        }

        // `format` keeps drive-relative roots such as `C:` intact, whereas `join` would anchor them.
        return new Path(
            nodePath.format({
                base: name,
                dir: parsed.dir,
                root: parsed.root,
            }),
        );
    }

    async access(...args: DropFirstParameters<typeof fsp.access>) {
        return await fsp.access(this.#value, ...args);
    }

    async appendFile(...args: DropFirstParameters<typeof fsp.appendFile>) {
        return await fsp.appendFile(this.#value, ...args);
    }

    async chmod(...args: DropFirstParameters<typeof fsp.chmod>) {
        return await fsp.chmod(this.#value, ...args);
    }

    async chown(...args: DropFirstParameters<typeof fsp.chown>) {
        return await fsp.chown(this.#value, ...args);
    }

    async copyFile(destination: PathLike, mode?: number) {
        return await fsp.copyFile(this.#value, toPathString(destination), mode);
    }

    async cp(destination: PathLike, opts?: fs.CopyOptions) {
        return await fsp.cp(this.#value, toPathString(destination), opts);
    }

    createReadStream(...args: DropFirstParameters<typeof createReadStream>) {
        return createReadStream(this.#value, ...args);
    }

    createWriteStream(...args: DropFirstParameters<typeof createWriteStream>) {
        return createWriteStream(this.#value, ...args);
    }

    /**
     * Checks whether the stored path exists, following symbolic links.
     *
     * @remarks
     * Resolves to `false` only when the path is missing (`ENOENT` or `ENOTDIR`), including a symbolic link whose
     * target is missing; other errors reject.
     */
    async exists() {
        return await this.stat({ throwIfNoEntry: false }) !== undefined;
    }

    /**
     * Matches files under the stored path against glob patterns.
     *
     * @remarks
     * The stored path is bound as `cwd`; relative patterns yield paths relative to it.
     */
    glob(
        pattern: readonly string[] | string,
        options?: Omit<fs.GlobOptionsWithoutFileTypes, 'cwd'>,
    ): NodeJS.AsyncIterator<string>;
    glob(
        pattern: readonly string[] | string,
        options: Omit<fs.GlobOptionsWithFileTypes, 'cwd'>,
    ): NodeJS.AsyncIterator<fs.Dirent>;
    glob(
        pattern: readonly string[] | string,
        options?: Omit<fs.GlobOptions, 'cwd'>,
    ): NodeJS.AsyncIterator<fs.Dirent | string>;
    glob(pattern: readonly string[] | string, options?: any): any {
        return fsp.glob(
            pattern,
            {
                ...options,
                cwd: this.#value,
            },
        );
    }

    /**
     * Checks whether the stored path is a directory, following symbolic links.
     *
     * @remarks
     * Resolves to `false` when the path is missing; other errors reject.
     */
    async isDirectory() {
        return (await this.stat({ throwIfNoEntry: false }))?.isDirectory() ?? false;
    }

    /**
     * Checks whether the stored path is a regular file, following symbolic links.
     *
     * @remarks
     * Resolves to `false` when the path is missing; other errors reject.
     */
    async isFile() {
        return (await this.stat({ throwIfNoEntry: false }))?.isFile() ?? false;
    }

    /**
     * Checks whether the stored path itself is a symbolic link.
     *
     * @remarks
     * Resolves to `false` when the path is missing; other errors reject.
     */
    async isSymbolicLink() {
        return (await this.lstat({ throwIfNoEntry: false }))?.isSymbolicLink() ?? false;
    }

    /**
     * Reads file system metadata for the stored path without following a final symbolic link.
     *
     * @remarks
     * If `throwIfNoEntry` is `false`, a missing path (`ENOENT` or `ENOTDIR`) resolves to `undefined` instead of
     * rejecting.
     */
    lstat(
        opts?: fs.StatOptions & {
            bigint?: false;
            throwIfNoEntry?: true;
        },
    ): Promise<fs.Stats>;
    lstat(
        opts: fs.StatOptions & {
            bigint: true;
            throwIfNoEntry?: true;
        },
    ): Promise<fs.BigIntStats>;
    lstat(
        opts: fs.StatOptions & {
            bigint?: false;
            throwIfNoEntry: false;
        },
    ): Promise<fs.Stats | undefined>;
    lstat(
        opts: fs.StatOptions & {
            bigint: true;
            throwIfNoEntry: false;
        },
    ): Promise<fs.BigIntStats | undefined>;
    lstat(opts: fs.StatOptions & { throwIfNoEntry?: true }): Promise<fs.BigIntStats | fs.Stats>;
    lstat(opts?: fs.StatOptions): Promise<fs.BigIntStats | fs.Stats | undefined>;
    async lstat(opts?: fs.StatOptions): Promise<fs.BigIntStats | fs.Stats | undefined> {
        return await readStats(fsp.lstat, this.#value, opts);
    }

    mkdir(options: fs.MakeDirectoryOptions & { recursive: true }): Promise<string | undefined>;
    mkdir(
        options?:
          | (fs.MakeDirectoryOptions & { recursive?: false })
          | fs.Mode
          | null,
    ): Promise<void>;
    mkdir(options?: fs.MakeDirectoryOptions | fs.Mode | null): Promise<string | undefined>;
    async mkdir(...args: any): Promise<any> {
        return await fsp.mkdir(this.#value, ...args);
    }

    async open(...args: DropFirstParameters<typeof fsp.open>) {
        return await fsp.open(this.#value, ...args);
    }

    async opendir(...args: DropFirstParameters<typeof fsp.opendir>) {
        return await fsp.opendir(this.#value, ...args);
    }

    readdir(
        options?:
          | BufferEncoding
          | (fs.ObjectEncodingOptions & {
              recursive?: boolean;
              withFileTypes?: false;
          })
          | null,
    ): Promise<string[]>;
    readdir(
        options:
          | 'buffer'
          | {
              encoding: 'buffer';
              recursive?: boolean;
              withFileTypes?: false;
          },
    ): Promise<Buffer[]>;
    readdir(
        options: fs.ObjectEncodingOptions & {
            recursive?: boolean;
            withFileTypes: true;
        },
    ): Promise<fs.Dirent[]>;
    readdir(
        options: {
            encoding: 'buffer';
            recursive?: boolean;
            withFileTypes: true;
        },
    ): Promise<Array<fs.Dirent<Buffer>>>;
    readdir(
        options?:
          | 'buffer'
          | ((fs.ObjectEncodingOptions | { encoding: 'buffer' }) & {
              recursive?: boolean;
              withFileTypes?: boolean;
          })
          | BufferEncoding
          | null,
    ): Promise<Array<fs.Dirent<Buffer>> | Buffer[] | fs.Dirent[] | string[]>;
    async readdir(...args: any): Promise<any> {
        return await fsp.readdir(this.#value, ...args);
    }

    readFile(
        options?:
          | (Abortable & {
              encoding?: null;
              flag?: fs.OpenMode;
          })
          | null,
    ): Promise<Buffer>;
    readFile(
        options:
          | (Abortable & {
              encoding: BufferEncoding;
              flag?: fs.OpenMode;
          })
          | BufferEncoding,
    ): Promise<string>;
    readFile(
        options?:
            | (
              & Abortable
              & fs.ObjectEncodingOptions
              & { flag?: fs.OpenMode }
            )
            | BufferEncoding
            | null,
    ): Promise<Buffer | string>;
    async readFile(...args: any): Promise<any> {
        return await fsp.readFile(this.#value, ...args);
    }

    readlink(options?: BufferEncoding | fs.ObjectEncodingOptions | null): Promise<string>;
    readlink(options: fs.BufferEncodingOption): Promise<Buffer>;
    readlink(
        options?: BufferEncoding | fs.BufferEncodingOption | fs.ObjectEncodingOptions | null,
    ): Promise<Buffer | string>;
    async readlink(...args: any): Promise<any> {
        return await fsp.readlink(this.#value, ...args);
    }

    realpath(options?: BufferEncoding | fs.ObjectEncodingOptions | null): Promise<string>;
    realpath(options: fs.BufferEncodingOption): Promise<Buffer>;
    realpath(
        options?: BufferEncoding | fs.BufferEncodingOption | fs.ObjectEncodingOptions | null,
    ): Promise<Buffer | string>;
    async realpath(...args: any): Promise<any> {
        return await fsp.realpath(this.#value, ...args);
    }

    async rename(newPath: PathLike) {
        return await fsp.rename(this.#value, toPathString(newPath));
    }

    async rm(...args: DropFirstParameters<typeof fsp.rm>) {
        return await fsp.rm(this.#value, ...args);
    }

    async rmdir(...args: DropFirstParameters<typeof fsp.rmdir>) {
        return await fsp.rmdir(this.#value, ...args);
    }

    /**
     * @remarks
     * If `throwIfNoEntry` is `false`, a missing path (`ENOENT` or `ENOTDIR`) resolves to `undefined` instead of
     * rejecting.
     */
    stat(
        opts?: fs.StatOptions & {
            bigint?: false;
            throwIfNoEntry?: true;
        },
    ): Promise<fs.Stats>;
    stat(
        opts: fs.StatOptions & {
            bigint: true;
            throwIfNoEntry?: true;
        },
    ): Promise<fs.BigIntStats>;
    stat(
        opts: fs.StatOptions & {
            bigint?: false;
            throwIfNoEntry: false;
        },
    ): Promise<fs.Stats | undefined>;
    stat(
        opts: fs.StatOptions & {
            bigint: true;
            throwIfNoEntry: false;
        },
    ): Promise<fs.BigIntStats | undefined>;
    stat(opts: fs.StatOptions & { throwIfNoEntry?: true }): Promise<fs.BigIntStats | fs.Stats>;
    stat(opts?: fs.StatOptions): Promise<fs.BigIntStats | fs.Stats | undefined>;
    async stat(opts?: fs.StatOptions): Promise<fs.BigIntStats | fs.Stats | undefined> {
        return await readStats(fsp.stat, this.#value, opts);
    }

    /**
     * Creates a symbolic link at the stored path pointing to a target.
     *
     * @remarks
     * The stored path is the new link; a relative target is resolved from the link's directory, and `type` only
     * applies on Windows.
     */
    async symlink(target: PathLike, type?: 'dir' | 'file' | 'junction' | null) {
        return await fsp.symlink(toPathString(target), this.#value, type);
    }

    async truncate(...args: DropFirstParameters<typeof fsp.truncate>) {
        return await fsp.truncate(this.#value, ...args);
    }

    async unlink() {
        return await fsp.unlink(this.#value);
    }

    async utimes(...args: DropFirstParameters<typeof fsp.utimes>) {
        return await fsp.utimes(this.#value, ...args);
    }

    // Bun's watcher is iterable with `for await` but lacks `next()`/`return()`, so only `AsyncIterable` is promised.
    watch(options?: BufferEncoding | PathWatchOptions): AsyncIterable<fsp.FileChangeInfo<string>> {
        // Node.js rejects string options and the `buffer` encoding here, although `@types/node` accepts both.
        return fsp.watch(
            this.#value,
            (typeof options === 'string' ? { encoding: options } : options) as fsp.WatchOptionsWithStringEncoding,
        );
    }

    async writeFile(...args: DropFirstParameters<typeof fsp.writeFile>) {
        return await fsp.writeFile(this.#value, ...args);
    }
}

async function readStats(
    read: (path: string, opts?: fs.StatOptions) => Promise<fs.BigIntStats | fs.Stats>,
    path: string,
    opts?: fs.StatOptions,
) {
    try {
        return await read(path, opts);
    } catch (error) {
        if (
            opts?.throwIfNoEntry === false
            && error instanceof Error
            && 'code' in error
            && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
        ) return undefined;

        throw error;
    }
}

function toPathString(path: PathLike) {
    if (path instanceof Path) return path.value;
    if (path instanceof URL) return fileURLToPath(path);
    const text = path.toString();
    // `Path` stores text, so a non-UTF-8 buffer would silently point at a different file.
    if (Buffer.isBuffer(path) && !Buffer.from(text).equals(path)) {
        throw new TypeError('Path buffers must contain valid UTF-8');
    }

    return text;
}
