import type { Buffer } from 'node:buffer';
import type { Abortable } from 'node:events';
import type * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import * as nodePath from 'node:path';

type DropFirstParameters<T extends (...args: any) => any> = Parameters<T> extends [any, ...infer R] ? R : never;

/**
 * Values accepted by the `Path` constructor and path-composition methods.
 */
export type PathLike = fs.PathLike | Path;

/**
 * An immutable file system path with Node.js path and file operations.
 *
 * @remarks
 * Path-composition methods return new instances and leave this instance unchanged.
 * File operations act on the stored path and forward Node.js defaults and promise rejections.
 * They do not update the stored path, including after a successful rename.
 * The constructor joins stringified inputs using the platform-specific Node.js path rules.
 */
export class Path {
    // Private instance properties
    readonly #value: string;

    // Constructor

    /**
     * Creates a normalized path value by joining the provided path segments.
     *
     * @param paths - Path segments accepted by Node.js `path.join` or another `Path` instance.
     */
    constructor(...paths: PathLike[]) {
        this.#value = nodePath.join(...this.#toStrings(paths));
    }

    // Private instance methods
    #newInstance(...paths: PathLike[]) {
        return new Path(...paths);
    }

    #toStrings(paths: PathLike[]) {
        return paths.map((path) => path.toString());
    }

    // Public instance accessors

    /**
     * The parent directory as a new `Path`; this instance is unchanged.
     *
     * @see {@link Path.dirname}
     */
    get parent() {
        return this.dirname();
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
     * @param paths - The stringified path segments to join.
     *
     * @returns A new absolute `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.resolve}
     */
    static resolve(...paths: PathLike[]) {
        return new this(...paths).resolve();
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
     * @returns A new `Path`; this instance is unchanged.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.dirname}
     */
    dirname() {
        return this.#newInstance(nodePath.dirname(this.#value));
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
     * @returns A new `Path`; this instance is unchanged.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.normalize}
     */
    normalize() {
        return this.#newInstance(nodePath.normalize(this.#value));
    }

    /**
     * Joins additional segments onto this path.
     *
     * @param paths - The stringified path segments to append.
     *
     * @returns A new normalized `Path`; this instance is unchanged.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.join}
     */
    join(...paths: PathLike[]) {
        return this.#newInstance(this.#value, ...this.#toStrings(paths));
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
     * @param to - The destination path.
     *
     * @returns A new `Path`; this instance is unchanged.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.relative}
     */
    relative(to: PathLike) {
        return this.#newInstance(nodePath.relative(this.#value, to.toString()));
    }

    /**
     * Resolves this path to an absolute path using the current working directory.
     *
     * @remarks
     * Relative paths use the current working directory. This instance is unchanged.
     *
     * @returns A new absolute `Path`.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.resolve}
     */
    resolve() {
        return this.#newInstance(nodePath.resolve(this.#value));
    }

    toJSON() {
        return this.#value;
    }

    /**
     * Converts this path to the Windows namespace form when applicable.
     *
     * @returns The namespace-converted path string; this instance is unchanged.
     * On non-Windows platforms, the path text is unchanged.
     *
     * @see {@link https://nodejs.org/api/path.html | Node.js path.toNamespacedPath}
     */
    toNamespacedPath() {
        return nodePath.toNamespacedPath(this.#value);
    }

    /**
     * Returns the stored path as a string.
     */
    toString() {
        return this.#value;
    }

    /**
     * Checks access permissions for the stored path.
     *
     * @remarks
     * The promise resolves when the access check succeeds and rejects if access is denied or the path is missing.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.access}
     */
    access(...args: DropFirstParameters<typeof fsp.access>) {
        return fsp.access(this.#value, ...args);
    }

    /**
     * Appends data to the file at the stored path.
     *
     * @remarks
     * The promise resolves when appending completes; a missing file is created according to the supplied options.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.appendFile}
     */
    appendFile(...args: DropFirstParameters<typeof fsp.appendFile>) {
        return fsp.appendFile(this.#value, ...args);
    }

    /**
     * Changes the permissions of the stored path.
     *
     * @remarks
     * The promise resolves when the permissions are changed.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.chmod}
     */
    chmod(...args: DropFirstParameters<typeof fsp.chmod>) {
        return fsp.chmod(this.#value, ...args);
    }

    /**
     * Changes the owner and group of the stored path.
     *
     * @remarks
     * The promise resolves when the ownership is changed.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.chown}
     */
    chown(...args: DropFirstParameters<typeof fsp.chown>) {
        return fsp.chown(this.#value, ...args);
    }

    /**
     * Copies the file at the stored path to a destination.
     *
     * @remarks
     * The promise resolves when copying completes. The stored path remains the source path.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.copyFile}
     */
    copyFile(...args: DropFirstParameters<typeof fsp.copyFile>) {
        return fsp.copyFile(this.#value, ...args);
    }

    /**
     * Creates a directory at the stored path.
     *
     * @remarks
     * The promise resolves after creation. Recursive mode resolves to the first created directory path, or
     * `undefined` if no directory is created; nonrecursive mode resolves without a value.
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
    mkdir(...args: any): any {
        return fsp.mkdir(this.#value, ...args);
    }

    /**
     * Opens the file at the stored path.
     *
     * @remarks
     * The promise resolves to a new file handle. The caller must close the handle when it is no longer needed.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.open}
     */
    open(...args: DropFirstParameters<typeof fsp.open>) {
        return fsp.open(this.#value, ...args);
    }

    /**
     * Reads the entries of the directory at the stored path.
     *
     * @remarks
     * The promise resolves to names, buffers, or directory entries according to the options.
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
    ): Promise<fs.Dirent<Buffer>[]>;
    readdir(...args: any): any {
        return fsp.readdir(this.#value, ...args);
    }

    /**
     * Reads the entire file at the stored path.
     *
     * @remarks
     * The promise resolves to a string when a text encoding is supplied, or a `Buffer` otherwise.
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
    readFile(...args: any): any {
        return fsp.readFile(this.#value, ...args);
    }

    /**
     * Renames or moves the file or directory at the stored path.
     *
     * @remarks
     * The promise resolves when the rename completes. This instance retains its original stored path.
     *
     * @param newPath - The destination path; this instance retains its original value.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rename}
     */
    rename(newPath: PathLike) {
        return fsp.rename(this.#value, newPath.toString());
    }

    /**
     * Removes the file or directory at the stored path.
     *
     * @remarks
     * The promise resolves after removal according to the supplied options.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rm}
     */
    rm(...args: DropFirstParameters<typeof fsp.rm>) {
        return fsp.rm(this.#value, ...args);
    }

    /**
     * Removes the directory at the stored path.
     *
     * @remarks
     * The promise resolves after directory removal.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.rmdir}
     */
    rmdir(...args: DropFirstParameters<typeof fsp.rmdir>) {
        return fsp.rmdir(this.#value, ...args);
    }

    /**
     * Reads file system metadata for the stored path.
     *
     * @remarks
     * The promise resolves to `Stats`, or `BigIntStats` when `bigint` is enabled.
     * If `throwIfNoEntry` is `false`, a missing path resolves to `undefined` instead of rejecting.
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
    stat(...args: any): any {
        return fsp.stat(this.#value, ...args);
    }

    /**
     * Truncates or extends the file at the stored path.
     *
     * @remarks
     * The promise resolves when the file reaches the requested length in bytes; the default length is `0`.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.truncate}
     */
    truncate(...args: DropFirstParameters<typeof fsp.truncate>) {
        return fsp.truncate(this.#value, ...args);
    }

    /**
     * Deletes the file or symbolic link at the stored path.
     *
     * @remarks
     * The promise resolves after deletion; directories are not removed.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.unlink}
     */
    unlink() {
        return fsp.unlink(this.#value);
    }

    /**
     * Writes data to the file at the stored path.
     *
     * @remarks
     * The promise resolves when writing completes; the default flag replaces existing file contents.
     *
     * @see {@link https://nodejs.org/api/fs.html | Node.js fsPromises.writeFile}
     */
    writeFile(...args: DropFirstParameters<typeof fsp.writeFile>) {
        return fsp.writeFile(this.#value, ...args);
    }
}
