import type {
    Buffer,
    Blob as NodeBlob,
    File as NodeFile,
} from 'node:buffer';

export type { FilteredKeyPath } from './filtered-key-path';

/**
 * A generic string-keyed object for utility APIs that intentionally accept any value shape.
 */
export type AnyRecord = Record<string, any>;

/**
 * Binary-like inputs accepted by `toBuffer` across browser and Node.js runtimes.
 */
export type BinaryInput = ArrayBuffer | Blob | Buffer | File | NodeBlob | NodeFile | Uint8Array;

/**
 * Boolean values represented either as booleans or common string literals.
 */
export type Booleanish = 'false' | 'true' | boolean;

/**
 * Accepts either a full object or a partial patch of that object.
 */
export type MaybePartial<T> = Partial<T> | T;

/**
 * Accepts either a mutable value or a readonly view of that value.
 */
export type MaybeReadonly<T> = Readonly<T> | T;

/**
 * Explicitly nullable value helper.
 */
export type Nullable<T> = null | T;

/**
 * Number-like value represented as a number or a numeric string.
 */
export type Numberish = number | string;

/**
 * A `Record` where every key is optional.
 */
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;

/**
 * A readonly `PartialRecord`.
 */
export type ReadonlyPartialRecord<K extends keyof any, T> = Readonly<PartialRecord<K, T>>;

/**
 * A readonly `Record`.
 */
export type ReadonlyRecord<K extends keyof any, T> = Readonly<Record<K, T>>;
