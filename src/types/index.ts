import type { Blob as NodeBlob } from 'node:buffer';

/**
 * Binary inputs accepted across browser and Node.js runtimes; `Buffer` and `File` are covered by `Uint8Array` and
 * `Blob`.
 */
export type BinaryInput = ArrayBuffer | Blob | NodeBlob | Uint8Array;

export type Booleanish = 'false' | 'true' | boolean;

export type MaybePartial<T> = Partial<T> | T;

export type MaybeReadonly<T> = Readonly<T> | T;

export type PartialRecord<K extends PropertyKey, T> = Partial<Record<K, T>>;

export type ReadonlyPartialRecord<K extends PropertyKey, T> = Readonly<PartialRecord<K, T>>;

export type ReadonlyRecord<K extends PropertyKey, T> = Readonly<Record<K, T>>;

/**
 * A promise whose rejection is handled internally and can safely be left unawaited.
 * This type only marks that contract; it does not add runtime rejection handling.
 */
export type SafePromise<T> = Promise<T> & { readonly __safePromise?: true };
