import type { ObjectId } from 'bson';

/**
 * The following types are based on or inspired by types from the Element Plus project.
 * Source: https://github.com/element-plus/element-plus
 * License: MIT (https://opensource.org/licenses/MIT)
 *
 * Original types might have been modified to suit this project’s needs.
 */

/***/
type ConditionalPath<K extends number | string, V, U> = V extends U ? `${K}` : DefaultPath<K, V, U, never>;
type DefaultPath<
    K extends number | string,
    V,
    U = never,
    RK = `${K}`,
> = V extends TerminalType ? RK : `${K}.${FilteredKeyPath<V, U>}`;

/**
 * A utility type that generates a union of key paths from a given object type `T`,
 * filtered by a specific type `U`. If `U` is
 * not provided, it defaults to including all key paths.
 *
 * @template T - The object type to traverse.
 * @template U - The type used to filter key paths. Defaults to `never`, meaning no filtering.
 */
// eslint-disable-next-line style/max-len
export type FilteredKeyPath<T, U = never> = T extends ReadonlyArray<infer V> ? (IsTuple<T> extends true ? { [K in TupleKey<T>]-?: PathImpl<Exclude<K, symbol>, T[K], U> }[TupleKey<T>] : PathImpl<number, V, U>) : { [K in keyof T]-?: PathImpl<Exclude<K, symbol>, T[K], U> }[keyof T];
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
