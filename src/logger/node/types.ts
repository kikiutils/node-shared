import type { PathLike } from '../../classes/path';
import type {
    Logger,
    LoggerOptions,
} from '../types';

/**
 * Specify interval and/or maxSize. Size limits use positive integers with B, K, M, or G (binary units).
 */
export type LoggerRotationOptions = {
    /**
     * Gzip historical files. Defaults to true.
     */
    compress?: boolean;

    /**
     * Number of historical files, excluding the active file. Defaults to 30.
     */
    keepFiles?: number;

    /**
     * Maximum combined size of historical files.
     */
    maxTotalSize?: string;
} & (
  | {
      /**
       * Opt-in time rotation aligned to the system's local calendar boundary.
       */
      interval: 'daily' | 'hourly';
      maxSize?: string;
  }
  | {
      /**
       * Opt-in time rotation aligned to the system's local calendar boundary.
       */
      interval?: 'daily' | 'hourly';
      maxSize: string;
  }
);

export interface LoggerFileOptions {
    /**
     * Maximum unfinished payload bytes, including data already submitted to the stream. Defaults to 8 MiB.
     */
    maxPendingBytes?: number;

    /**
     * Resolved once at creation. The file is opened in append mode and must have a single writer: another logger or
     * process writing or rotating the same path can lose records.
     */
    path: PathLike;

    /**
     * Omitted or false disables rotation. An object must specify interval or maxSize.
     */
    rotate?: false | LoggerRotationOptions;
}

export interface NodeLogger extends Logger {
    /**
     * Stop accepting records, finish accepted console and file writes, and release the file stream. Not fsync.
     * A stalled stdout or stderr reader delays it; the shared console stream listeners stay attached.
     */
    close: () => Promise<void>;

    /**
     * A fresh, frozen file-output snapshot.
     */
    getStats: () => Readonly<NodeLoggerStats>;
}

export interface NodeLoggerOptions extends LoggerOptions {
    /**
     * Disabled by default. Each logger owns at most one fixed file destination.
     */
    file?: false | LoggerFileOptions;
}

export interface NodeLoggerStats {
    droppedCount: number;

    /**
     * Accepted or later records that were not written because file output failed.
     */
    failedCount: number;
    pendingBytes: number;

    /**
     * Failure events, not records: the failure that disables file output plus rotation cleanup warnings.
     * `rotating-file-stream` treats a short write as success, so a nearly full disk can truncate a record unnoticed.
     */
    writeErrorCount: number;
}
