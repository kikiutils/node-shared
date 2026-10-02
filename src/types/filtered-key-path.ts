import type { ObjectId } from 'bson';

// Types adapted from Element Plus: https://github.com/element-plus/element-plus.
// Original license: MIT (https://opensource.org/licenses/MIT).

type ConditionalPath<K extends number | string, V, U> = V extends U ? `${K}` : DefaultPath<K, V, U, never>;
type DefaultPath<
    K extends number | string,
    V,
    U = never,
    RK = `${K}`,
> = V extends TerminalType ? RK : `${K}.${FilteredKeyPath<V, U>}`;

/* eslint-disable style/max-len -- The existing conditional type is kept on one source line. */

/**
 * A union of nested object key paths optionally filtered by the matching value type.
 *
 * @typeParam T - The object type to traverse.
 * @typeParam U - The value type to select; `never` disables filtering.
 */
export type FilteredKeyPath<T, U = never> = T extends ReadonlyArray<infer V> ? (IsTuple<T> extends true ? { [K in TupleKey<T>]-?: PathImpl<Exclude<K, symbol>, T[K], U> }[TupleKey<T>] : PathImpl<number, V, U>) : { [K in keyof T]-?: PathImpl<Exclude<K, symbol>, T[K], U> }[keyof T];
/* eslint-enable style/max-len */

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length'] ? false : true;
type PathImpl<K extends number | string, V, U> = [U] extends [never] ? DefaultPath<K, V> : ConditionalPath<K, V, U>;
type TerminalType =
  | bigint
  | Blob
  | boolean
  | Date
  | File
  | null
  | number
  | ObjectId
  | RegExp
  | string
  | symbol
  | undefined;

type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
