import type { Buffer } from 'node:buffer';
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
 * Values accepted wherever `Path` takes a path; `file:` URLs are converted to file system paths.
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
     *
     * @param paths - Path segments; `file:` URLs are converted to file system paths.
     */
    constructor(...paths: PathLike[]) {
        this.#value = nodePath.join(...paths.map(toPathString));
    }

    // Private instance methods
    #hasSeparator(value: string) {
        return value.includes('/') || value.includes(nodePath.sep);
    }

    #withBase(base: string) {
        if (!base || base === '.' || base === '..' || this.#hasSeparator(base)) {
            throw new TypeError(`Invalid final component: ${base}`);
        }

        const parsed = nodePath.parse(this.#value);
        if (!parsed.base) throw new TypeError(`Path has no final component: ${this.#value}`);
        // `format` keeps drive-relative roots such as `C:` intact, whereas `join` would anchor them.
        return new Path(
            nodePath.format({
                base,
                dir: parsed.dir,
                root: parsed.root,
            }),
        );
    }

    // Public instance accessors

    /**
     * The parent directory as a new `Path`.
     *
     * @see {@link Path.dirname}
     */
    get parent() {
        return this.dirname();
    }

    /**
     * The final path component without its last extension.
     *
     * @remarks
     * A leading dot does not start an extension, so `.env` keeps its full name.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.parse}
     */
    get stem() {
        return nodePath.parse(this.#value).name;
    }

    /**
     * The normalized path string stored by this instance.
     */
    get value() {
        return this.#value;
    }

    // Public static methods

    /**
     * Creates a new path from a Node.js path object.
     *
     * @param pathObject - The path components to format.
     *
     * @returns A new normalized `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.format}
     */
    static format(pathObject: nodePath.FormatInputPathObject) {
        return new Path(nodePath.format(pathObject));
    }

    /**
     * Resolves joined path segments to an absolute path.
     *
     * @remarks
     * Inputs are joined before resolution; unlike Node.js `path.resolve`,
     * later absolute segments do not reset the path.
     *
     * @param paths - The path segments to join.
     *
     * @returns A new absolute `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.resolve}
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

    /**
     * Returns the final component of this path.
     *
     * @param suffix - An optional exact suffix to remove.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.basename}
     */
    basename(suffix?: string) {
        return nodePath.basename(this.#value, suffix);
    }

    /**
     * Returns the parent directory of this path.
     *
     * @returns A new `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.dirname}
     */
    dirname() {
        return new Path(nodePath.dirname(this.#value));
    }

    /**
     * Returns the extension of the final path component.
     *
     * @returns The extension including its leading dot, or an empty string when absent.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.extname}
     */
    extname() {
        return nodePath.extname(this.#value);
    }

    /**
     * Checks whether this path is absolute on the current platform.
     *
     * @returns Whether this path is absolute.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.isAbsolute}
     */
    isAbsolute() {
        return nodePath.isAbsolute(this.#value);
    }

    /**
     * Normalizes separators and relative segments in this path.
     *
     * @returns A new `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.normalize}
     */
    normalize() {
        return new Path(nodePath.normalize(this.#value));
    }

    /**
     * Joins additional segments onto this path.
     *
     * @param paths - The path segments to append.
     *
     * @returns A new normalized `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.join}
     */
    join(...paths: PathLike[]) {
        return new Path(this.#value, ...paths);
    }

    /**
     * Parses this path into its root, directory, basename, extension, and name.
     *
     * @returns A new object containing the path components.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.parse}
     */
    parse() {
        return nodePath.parse(this.#value);
    }

    /**
     * Computes a relative path from this path to the destination.
     *
     * @param to - The path to compute the relative path to.
     *
     * @returns A new `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.relative}
     */
    relative(to: PathLike) {
        return new Path(nodePath.relative(this.#value, toPathString(to)));
    }

    /**
     * Resolves this path to an absolute path using the current working directory.
     *
     * @returns A new absolute `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.resolve}
     */
    resolve() {
        return new Path(nodePath.resolve(this.#value));
    }

    toJSON() {
        return this.#value;
    }

    /**
     * Converts this path to the Windows namespace form when applicable.
     *
     * @returns A new `Path` with the namespace-converted path.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.toNamespacedPath}
     */
    toNamespacedPath() {
        return new Path(nodePath.toNamespacedPath(this.#value));
    }

    /**
     * Returns the stored path as a string.
     */
    toString() {
        return this.#value;
    }

    /**
     * Replaces the last extension of the final path component.
     *
     * @param extension - The new extension including its leading dot, or an empty string to remove the extension.
     *
     * @returns A new `Path`.
     *
     * @throws TypeError if a nonempty extension is `.`, lacks a leading dot, or contains a path separator;
     * if the resulting name is `.` or `..`; or if this path has no final component.
     */
    withExtension(extension: string) {
        if (extension && (!extension.startsWith('.') || extension === '.' || this.#hasSeparator(extension))) {
            throw new TypeError(`Invalid extension: ${extension}`);
        }

        return this.#withBase(`${this.stem}${extension}`);
    }

    /**
     * Replaces the final path component.
     *
     * @param name - The new final component.
     *
     * @returns A new `Path`.
     *
     * @throws TypeError if the name is empty, `.`, `..`, or contains a path separator,
     * or if this path has no final component.
     */
    withName(name: string) {
        return this.#withBase(name);
    }

    /**
     * Checks access permissions for the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.access}
     */
    async access(...args: DropFirstParameters<typeof fsp.access>) {
        return await fsp.access(this.#value, ...args);
    }

    /**
     * Appends data to the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.appendFile}
     */
    async appendFile(...args: DropFirstParameters<typeof fsp.appendFile>) {
        return await fsp.appendFile(this.#value, ...args);
    }

    /**
     * Changes the permissions of the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.chmod}
     */
    async chmod(...args: DropFirstParameters<typeof fsp.chmod>) {
        return await fsp.chmod(this.#value, ...args);
    }

    /**
     * Changes the owner and group of the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.chown}
     */
    async chown(...args: DropFirstParameters<typeof fsp.chown>) {
        return await fsp.chown(this.#value, ...args);
    }

    /**
     * Copies the file at the stored path to a destination.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.copyFile}
     */
    async copyFile(destination: PathLike, mode?: number) {
        return await fsp.copyFile(this.#value, toPathString(destination), mode);
    }

    /**
     * Copies the file or directory at the stored path to a destination.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.cp}
     */
    async cp(destination: PathLike, opts?: fs.CopyOptions) {
        return await fsp.cp(this.#value, toPathString(destination), opts);
    }

    /**
     * Opens a readable stream for the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fs.createReadStream}
     */
    createReadStream(...args: DropFirstParameters<typeof createReadStream>) {
        return createReadStream(this.#value, ...args);
    }

    /**
     * Opens a writable stream for the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fs.createWriteStream}
     */
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
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.glob}
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
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.lstat}
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

    /**
     * Creates a directory at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.mkdir}
     */
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

    /**
     * Opens the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.open}
     */
    async open(...args: DropFirstParameters<typeof fsp.open>) {
        return await fsp.open(this.#value, ...args);
    }

    /**
     * Opens the directory at the stored path for iteration.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.opendir}
     */
    async opendir(...args: DropFirstParameters<typeof fsp.opendir>) {
        return await fsp.opendir(this.#value, ...args);
    }

    /**
     * Reads the entries of the directory at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.readdir}
     */
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
        options?:
          | BufferEncoding
          | (fs.ObjectEncodingOptions & {
              recursive?: boolean;
              withFileTypes?: false;
          })
          | null,
    ): Promise<Buffer[] | string[]>;
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
    async readdir(...args: any): Promise<any> {
        return await fsp.readdir(this.#value, ...args);
    }

    /**
     * Reads the entire file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.readFile}
     */
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

    /**
     * Reads the target of the symbolic link at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.readlink}
     */
    readlink(options?: BufferEncoding | fs.ObjectEncodingOptions | null): Promise<string>;
    readlink(options: fs.BufferEncodingOption): Promise<Buffer>;
    readlink(
        options?: BufferEncoding | fs.BufferEncodingOption | fs.ObjectEncodingOptions | null,
    ): Promise<Buffer | string>;
    async readlink(...args: any): Promise<any> {
        return await fsp.readlink(this.#value, ...args);
    }

    /**
     * Resolves the stored path to its canonical absolute form.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.realpath}
     */
    realpath(options?: BufferEncoding | fs.ObjectEncodingOptions | null): Promise<string>;
    realpath(options: fs.BufferEncodingOption): Promise<Buffer>;
    realpath(
        options?: BufferEncoding | fs.BufferEncodingOption | fs.ObjectEncodingOptions | null,
    ): Promise<Buffer | string>;
    async realpath(...args: any): Promise<any> {
        return await fsp.realpath(this.#value, ...args);
    }

    /**
     * Renames or moves the file or directory at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rename}
     */
    async rename(newPath: PathLike) {
        return await fsp.rename(this.#value, toPathString(newPath));
    }

    /**
     * Removes the file or directory at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rm}
     */
    async rm(...args: DropFirstParameters<typeof fsp.rm>) {
        return await fsp.rm(this.#value, ...args);
    }

    /**
     * Removes the directory at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rmdir}
     */
    async rmdir(...args: DropFirstParameters<typeof fsp.rmdir>) {
        return await fsp.rmdir(this.#value, ...args);
    }

    /**
     * Reads file system metadata for the stored path.
     *
     * @remarks
     * If `throwIfNoEntry` is `false`, a missing path (`ENOENT` or `ENOTDIR`) resolves to `undefined` instead of
     * rejecting.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.stat}
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
     * The stored path is the new link; a relative target is resolved from the link's directory.
     *
     * @param target - The path the link points to.
     * @param type - The link type, used only on Windows.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.symlink}
     */
    async symlink(target: PathLike, type?: 'dir' | 'file' | 'junction' | null) {
        return await fsp.symlink(toPathString(target), this.#value, type);
    }

    /**
     * Truncates or extends the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.truncate}
     */
    async truncate(...args: DropFirstParameters<typeof fsp.truncate>) {
        return await fsp.truncate(this.#value, ...args);
    }

    /**
     * Deletes the file or symbolic link at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.unlink}
     */
    async unlink() {
        return await fsp.unlink(this.#value);
    }

    /**
     * Changes the access and modification times of the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.utimes}
     */
    async utimes(...args: DropFirstParameters<typeof fsp.utimes>) {
        return await fsp.utimes(this.#value, ...args);
    }

    /**
     * Watches the stored path for changes.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.watch}
     */
    watch(options?: BufferEncoding | PathWatchOptions): NodeJS.AsyncIterator<fsp.FileChangeInfo<string>> {
        // Node.js rejects string options and the `buffer` encoding here, although `@types/node` accepts both.
        return fsp.watch(
            this.#value,
            (typeof options === 'string' ? { encoding: options } : options) as fsp.WatchOptionsWithStringEncoding,
        );
    }

    /**
     * Writes data to the file at the stored path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.writeFile}
     */
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
    return path.toString();
}
