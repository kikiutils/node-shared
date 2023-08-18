import { stat as _stat, statSync as _statSync } from '@kikiutils/fs-extra';
import { PathLike } from 'fs';

/**
 * Check path is a directory.
 *
 * Returns false if an error occurs.
 */
export const isDir = async (path: PathLike) => (await _stat(path))?.isDirectory() || false;

/**
 * @see {@link isDir}
 */
export const isDirSync = (path: PathLike) => _statSync(path)?.isDirectory() || false;

/**
 * Check path is a file.
 *
 * Returns false if an error occurs.
 */
export const isFile = async (path: PathLike) => (await _stat(path))?.isFile() || false;

/**
 * @see {@link isFile}
 */
export const isFileSync = (path: string) => _statSync(path)?.isFile() || false;
