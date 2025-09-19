import type { Buffer } from 'node:buffer';
import type { Abortable } from 'node:events';
import type * as fs from 'node:fs';
import * as fsp from 'node:fs/promises';
import {
    basename,
    dirname,
    extname,
    format,
    isAbsolute,
    join,
    normalize,
    parse,
    relative,
    resolve,
    toNamespacedPath,
} from 'node:path';
import type * as nodePath from 'node:path';

import * as fsExtra from 'fs-extra';
import type {
    JFReadOptions,
    JFWriteOptions,
} from 'jsonfile';

export type DoNotRemoveOrUseThisType = typeof fsExtra;
type DropFirstParameters<T extends (...args: any) => any> = Parameters<T> extends [any, ...infer R] ? R : never;
export type PathLike = fs.PathLike | Path;

/**
 * Class representing a file system path with various utility methods for path operations.
 *
 * All methods in the `Path` class are immutable, returning new instances with modified values
 * and leaving the original instance unchanged.
 */
export class Path {
    readonly #value: string;

    constructor(...paths: PathLike[]) {
        this.#value = join(...this.#toStrings(paths));
    }

    // Private methods
    #newInstance(...paths: PathLike[]) {
        return new Path(...paths);
    }

    #toStrings(paths: PathLike[]) {
        return paths.map((path) => path.toString());
    }

    // Symbols
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return this.#value;
    }

    [Symbol.toPrimitive](hint: string) {
        if (hint === 'number') throw new TypeError('Cannot convert a Path to a number');
        return this.#value;
    }

    // Public getters

    /**
     * @see {@link nodePath.dirname}
     */
    get parent() {
        return this.dirname();
    }

    /**
     * Returns the internal path string value.
     */
    get value() {
        return this.#value;
    }

    // Static methods

    /**
     * @see {@link nodePath.format}
     */
    static format(pathObject: nodePath.FormatInputPathObject) {
        return new Path(format(pathObject));
    }

    /**
     * @see {@link nodePath.resolve}
     */
    static resolve(...paths: PathLike[]) {
        return new this(...paths).resolve();
    }

    // Base methods

    /**
     * @see {@link nodePath.basename}
     */
    basename(suffix?: string) {
        return basename(this.#value, suffix);
    }

    /**
     * @see {@link nodePath.dirname}
     */
    dirname() {
        return this.#newInstance(dirname(this.#value));
    }

    /**
     * @see {@link nodePath.extname}
     */
    extname() {
        return extname(this.#value);
    }

    /**
     * @see {@link nodePath.isAbsolute}
     */
    isAbsolute() {
        return isAbsolute(this.#value);
    }

    /**
     * @see {@link nodePath.normalize}
     */
    normalize() {
        return this.#newInstance(normalize(this.#value));
    }

    /**
     * @see {@link nodePath.join}
     */
    join(...paths: PathLike[]) {
        return this.#newInstance(this.#value, ...this.#toStrings(paths));
    }

    /**
     * @see {@link nodePath.parse}
     */
    parse() {
        return parse(this.#value);
    }

    /**
     * @see {@link nodePath.relative}
     */
    relative(to: PathLike) {
        return this.#newInstance(relative(this.#value, to.toString()));
    }

    /**
     * @see {@link nodePath.resolve}
     */
    resolve() {
        return this.#newInstance(resolve(this.#value));
    }

    toJSON() {
        return this.#value;
    }

    /**
     * @see {@link nodePath.toNamespacedPath}
     */
    toNamespacedPath() {
        return toNamespacedPath(this.#value);
    }

    /**
     * Converts the Path instance to a string.
     * This method returns the internal path string value,
     * making it useful for implicit and explicit string conversions.
     */
    toString() {
        return this.#value;
    }

    // Some commonly used promise fs methods

    /**
     * @see {@link fsp.access}
     */
    access(...args: DropFirstParameters<typeof fsp.access>) {
        return fsp.access(this.#value, ...args);
    }

    /**
     * @see {@link fsp.appendFile}
     */
    appendFile(...args: DropFirstParameters<typeof fsp.appendFile>) {
        return fsp.appendFile(this.#value, ...args);
    }

    /**
     * @see {@link fsp.chmod}
     */
    chmod(...args: DropFirstParameters<typeof fsp.chmod>) {
        return fsp.chmod(this.#value, ...args);
    }

    /**
     * @see {@link fsp.chown}
     */
    chown(...args: DropFirstParameters<typeof fsp.chown>) {
        return fsp.chown(this.#value, ...args);
    }

    /**
     * @see {@link fsp.copyFile}
     */
    copyFile(...args: DropFirstParameters<typeof fsp.copyFile>) {
        return fsp.copyFile(this.#value, ...args);
    }

    /**
     * @see {@link fsp.mkdir}
     */
    mkdir(
        options: fs.MakeDirectoryOptions & {
            recursive: true;
        },
    ): Promise<string>;
    mkdir(
        options?:
          | (fs.MakeDirectoryOptions & {
              recursive?: false;
          })
          | fs.Mode
          | null,
    ): Promise<void>;
    mkdir(options?: fs.MakeDirectoryOptions | fs.Mode | null): Promise<string | undefined>;
    mkdir(...args: any): any {
        return fsp.mkdir(this.#value, ...args);
    }

    /**
     * @see {@link fsp.open}
     */
    open(...args: DropFirstParameters<typeof fsp.open>) {
        return fsp.open(this.#value, ...args);
    }

    /**
     * @see {@link fsp.readdir}
     */
    readdir(
        path: PathLike,
        options?:
          | BufferEncoding
          | (fs.ObjectEncodingOptions & {
              recursive?: boolean;
              withFileTypes?: false;
          })
          | null,
    ): Promise<string[]>;
    readdir(
        path: PathLike,
        options:
          | 'buffer'
          | {
              encoding: 'buffer';
              recursive?: boolean;
              withFileTypes?: false;
          },
    ): Promise<Buffer[]>;
    readdir(
        path: PathLike,
        options?:
          | BufferEncoding
          | (fs.ObjectEncodingOptions & {
              recursive?: boolean;
              withFileTypes?: false;
          })
          | null,
    ): Promise<Buffer[] | string[]>;
    readdir(
        path: PathLike,
        options: fs.ObjectEncodingOptions & {
            recursive?: boolean;
            withFileTypes: true;
        },
    ): Promise<fs.Dirent[]>;
    readdir(
        path: PathLike,
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
     * @see {@link fsp.readFile}
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
     * @see {@link fsp.rename}
     */
    rename(newPath: PathLike) {
        return fsp.rename(this.#value, newPath.toString());
    }

    /**
     * @see {@link fsp.rm}
     */
    rm(...args: DropFirstParameters<typeof fsp.rm>) {
        return fsp.rm(this.#value, ...args);
    }

    /**
     * @see {@link fsp.rmdir}
     */
    rmdir(...args: DropFirstParameters<typeof fsp.rmdir>) {
        return fsp.rmdir(this.#value, ...args);
    }

    /**
     * @see {@link fsp.stat}
     */
    stat(
        opts?: fs.StatOptions & {
            bigint?: false;
        },
    ): Promise<fs.Stats>;
    stat(
        opts: fs.StatOptions & {
            bigint: true;
        },
    ): Promise<fs.BigIntStats>;
    stat(opts?: fs.StatOptions): Promise<fs.BigIntStats | fs.Stats>;
    stat(...args: any): any {
        return fsp.stat(this.#value, ...args);
    }

    /**
     * @see {@link fsp.truncate}
     */
    truncate(...args: DropFirstParameters<typeof fsp.truncate>) {
        return fsp.truncate(this.#value, ...args);
    }

    /**
     * @see {@link fsp.unlink}
     */
    unlink() {
        return fsp.unlink(this.#value);
    }

    /**
     * @see {@link fsp.writeFile}
     */
    writeFile(...args: DropFirstParameters<typeof fsp.writeFile>) {
        return fsp.writeFile(this.#value, ...args);
    }

    // Some commonly used promise fs extra methods

    /**
     * @see {@link fsExtra.ensureDir}
     */
    ensureDir(options?: fsExtra.EnsureDirOptions | number) {
        return fsExtra.ensureDir(this.#value, options);
    }

    /**
     * @see {@link fsExtra.ensureDir}
     */
    mkdirp = this.ensureDir;

    /**
     * @see {@link fsExtra.ensureDir}
     */
    mkdirs = this.ensureDir;

    /**
     * @see {@link fsExtra.readJson}
     */
    async readJson<T = any>(options?: JFReadOptions) {
        return await fsExtra.readJson(this.#value, options) as T;
    }

    /**
     * @see {@link fsExtra.remove}
     */
    remove() {
        return fsExtra.remove(this.#value);
    }

    /**
     * @see {@link fsExtra.writeJson}
     */
    writeJson(data: any, options?: JFWriteOptions) {
        return fsExtra.writeJson(this.#value, data, options);
    }
}
