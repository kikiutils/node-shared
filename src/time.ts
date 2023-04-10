/**
 * Local timestamp to utc (second).
 */
export const localTimestampToUTC = (timestamp: number) => timestamp + timeZoneOffset;

/**
 * Local timestamp to utc (millisecond).
 */
export const localTimestampToUTCMs = (timestampMs: number) => timestampMs + timeZoneOffsetMs;

/**
 * Get now utc timestamp (second).
 */
export const nowTimestampUTC = () => Math.floor(nowTimestampUTCMs() / 1000);

/**
 * Get now utc timestamp (millisecond).
 */
export const nowTimestampUTCMs = () => localTimestampToUTCMs(new Date().getTime());

/**
 * Base timezone offset (second).
 */
export const timeZoneOffset = new Date().getTimezoneOffset() * 60;

/**
 * Base timezone offset (millisecond).
 */
export const timeZoneOffsetMs = timeZoneOffset * 1000;

/**
 * UTC timestamp to local (second).
 */
export const utcTimestampToLocal = (timestamp: number) => timestamp - timeZoneOffset;

/**
 * UTC timestamp to local (millisecond).
 */
export const utcTimestampToLocalMs = (timestampMs: number) => timestampMs - timeZoneOffsetMs;
