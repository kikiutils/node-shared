import type {
    Buffer,
    Blob as NodeBlob,
    File as NodeFile,
} from 'node:buffer';

export type { FilteredKeyPath } from './filtered-key-path';

export type AnyRecord = Record<string, any>;
export type BinaryInput = ArrayBuffer | Blob | Buffer | File | NodeBlob | NodeFile | Uint8Array;
export type Booleanish = 'false' | 'true' | boolean;
export type MaybePartial<T> = Partial<T> | T;
export type MaybeReadonly<T> = Readonly<T> | T;
export type Nullable<T> = null | T;
export type Numberish = number | string;
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
export type ReadonlyPartialRecord<K extends keyof any, T> = Readonly<PartialRecord<K, T>>;
export type ReadonlyRecord<K extends keyof any, T> = Readonly<Record<K, T>>;
