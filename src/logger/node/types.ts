import type { PathLike } from '../../classes/path';
import type {
    Logger,
    LoggerOptions,
} from '../types';

/** Size limits are positive integers with a B, K, M, or G suffix in binary units. */
export type LoggerRotationOptions = {
    /** Gzips historical files. */
    compress?: boolean;

    /** Number of historical files, excluding the active file. */
    maxFiles?: number;

    /** Maximum combined size of historical files. */
    maxTotalSize?: string;
} & (
  | {
      /** Opt-in time rotation aligned to the system's local calendar boundary. */
      interval: 'daily' | 'hourly';
      maxFileSize?: string;
  }
  | {
      /** Opt-in time rotation aligned to the system's local calendar boundary. */
      interval?: 'daily' | 'hourly';
      maxFileSize: string;
  }
);

export interface LoggerFileOptions {
    /** Maximum unfinished payload bytes, including data already submitted to the stream. */
    maxPendingBytes?: number;

    /**
     * Resolved once at creation. The file is opened in append mode and must have a single writer: another logger or
     * process writing or rotating the same path can lose records.
     */
    path: PathLike;

    rotate?: false | LoggerRotationOptions;
}

export interface NodeLogger extends Logger {
    /**
     * Stops accepting records, finishes accepted console and file writes, and releases the file stream. Not fsync.
     * A stalled stdout or stderr reader delays it; the shared console stream listeners stay attached.
     */
    close: () => Promise<void>;

    /** A fresh, frozen file-output snapshot. */
    getStats: () => Readonly<NodeLoggerStats>;
}

export interface NodeLoggerOptions extends LoggerOptions {
    file?: false | LoggerFileOptions;
}

export interface NodeLoggerStats {
    /**
     * Failure events, not records: the failure that disables file output plus rotation cleanup warnings.
     * `rotating-file-stream` treats a short write as success, so a nearly full disk can truncate a record unnoticed.
     */
    errorEventCount: number;

    /** Accepted or later records that were not written because file output failed. */
    failedCount: number;
    overflowCount: number;

    pendingBytes: number;
}
