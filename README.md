# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A lightweight, modular TypeScript utility library for Node.js and browser projects. It groups small, focused helpers for binary conversion, hashing, logging, dates, enum extraction, environment variables, numeric formatting, strings, URLs, Vue, web redirects, and typed storage wrappers.

- [✨ Release Notes](./CHANGELOG.md)

## Features

- 📦 Modular imports — import only the modules you use via `@kikiutils/shared/<module>`.
- 🧱 TypeScript-first — ships source and declaration output for strongly typed utility APIs.
- 🔁 General helpers — normalize single-or-array values with `extractFirstValue`.
- 🧬 Binary helpers — convert `Blob`, `File`, `ArrayBuffer`, `Uint8Array`, and `Buffer` to Node `Buffer`.
- 🔒 Hashing helpers — SHA-3 helpers for universal usage and Node `crypto` MD5/SHA-3 helpers.
- 📜 Logging helpers — preconfigured Consola and Pino logger instances with env-based levels.
- 📅 Date helpers — format dates and compute common ranges such as today, this week, and last month.
- 🔢 Number and math helpers — compact number display, precise percentages, and fixed-decimal arithmetic.
- 🔤 String/random helpers — random strings and randomized-length value generation.
- 🧾 Object helpers — deterministic nested object serialization for signatures and cache keys.
- 🧭 URL helpers — append or replace redirect query parameters safely.
- 🌱 Environment helpers — read required environment variables with a dedicated missing-env error.
- 🧩 Vue/web helpers — Vue Router redirects, timer ref cleanup, scroll preservation, and browser redirects.
- 🗄️ Storage helpers — typed keyed-store facades for LRU cache and Redis-like storage.
- 🛤️ Class utilities — immutable `Path` wrapper and chainable `PrecisionNumber` arithmetic.
- 🧰 Shared types — reusable nullable, readonly, partial-record, binary-input, and filtered-key-path types.

## Requirements

- **Node.js** `>=22.12.0`
- **ESM** package (`"type": "module"`)
- Optional peer dependencies are installed only when you use the modules that need them.

## Installation

Using [pnpm](https://pnpm.io):

```bash
pnpm add @kikiutils/shared
```

You can also use `npm`, `yarn`, or `bun`.

> [!NOTE]
> This package is intentionally modular. Imports such as `@kikiutils/shared/datetime` or `@kikiutils/shared/vue` may require their peer dependencies (`date-fns`, `vue`, and so on). Install only the peers used by your chosen modules.

## Usage and import style

Import individual modules to keep dependency usage explicit:

```typescript
import { logger } from '@kikiutils/shared/consola';
import { extractFirstValue } from '@kikiutils/shared/general';

const value = extractFirstValue([
    0,
    1,
]);

logger.info(value); // 0
```

## Module guide

| Module | Runtime | Main exports | Use case |
| --- | --- | --- | --- |
| `buffer` | Node/browser-compatible inputs, Node output | `toBuffer` | Convert `Blob`, `File`, `ArrayBuffer`, `Uint8Array`, or `Buffer` to Node `Buffer`. |
| `clipboard` | Browser | `copyTextToClipboard`, `copyBlobToClipboard` | Safe result wrappers around the modern Clipboard API. |
| `consola` | Node/browser | `consolaLogger`, `logger` | Shared Consola instance with env-based log level. |
| `crypto-hash` | Node | `cryptoMd5`, `cryptoSha3*`, `*ToBuffer` | Node `crypto` MD5/SHA-3 helpers with text or raw-buffer output. |
| `datetime` | Node/browser | `formatDate`, `getDateRangeFromDate`, `getMidnightDateFromToday` | Date formatting and common date-range calculations via `date-fns`. |
| `element-plus` | Vue/browser | `createElFormItemRuleWithDefaults` | Create Element Plus form rules with default `required`, `trigger`, and `type`. |
| `enum` | Any | `getEnumValues`, `getEnumNumberValues`, `getEnumStringValues` | Extract TypeScript enum values while ignoring numeric reverse mappings. |
| `env` | Node | `checkAndGetEnvValue`, `EnvironmentNotFoundError` | Read required env vars without treating empty strings as missing. |
| `event-awaiter` | Any | `EventAwaiter` | Wait/trigger keyed asynchronous events with timeout, abort, strict, and override modes. |
| `general` | Any | `extractFirstValue` | Normalize a single value or array into the first resolved value. |
| `hash` | Any | `sha3224`, `sha3256`, `sha3384`, `sha3512` | SHA-3 helpers backed by `@noble/hashes`; returns hex strings. |
| `math` | Any | `toPercentageString` | Precise percentage strings using `decimal.js`. |
| `number` | Any | `toCompactNumberString` | Compact display strings using `millify`. |
| `object` | Any | `stringifyObjectDeterministically` | Stable flattened object serialization for signatures/cache keys. |
| `pino` | Node | `pinoLogger`, `logger` | Shared Pino logger with pretty output and env-based level. |
| `random` | Any | `generateWithNestedRandomLength` | Generate values with a two-step randomized length. |
| `string` | Any | `randomString` | Random strings from preset character sets. |
| `time` | Any | `abortableDelay` | Promise delay that resolves early on abort. |
| `url` | Any | `appendRedirectParamToUrl` | Add or replace a `redirect` query parameter. |
| `vue` | Vue/browser | `appendRedirectParamFromCurrentRouteToUrl`, `clearIntervalRef`, `clearTimeoutRef`, `usePreserveScroll` | Vue Router redirect and ref cleanup helpers. |
| `web` | Browser | `appendRedirectParamFromCurrentLocationToUrl`, `assignUrlWithRedirectParamFromCurrentLocation` | Browser redirect helpers based on `window.location`. |
| `classes/path` | Node | `Path` | Immutable path wrapper plus common `fs/promises` delegations. |
| `classes/precision-number` | Any | `PrecisionNumber` | Chainable fixed-decimal arithmetic powered by `decimal.js`. |
| `storages/lru/keyed-store` | Any | `createLruKeyedStore` | Typed key resolver wrapper around `lru-cache`. |
| `storages/redis/keyed-store` | Node | `createRedisKeyedStore` | Typed key resolver wrapper around Redis-like storage. |
| `storages/redis/msgpack` | Node | `createRedisMsgpackStorage` | Redis-like storage facade with MessagePack serialization. |
| `types` | TypeScript | Common utility types | Shared utility and path-filtering types. |

## Examples

### Required environment variable

```typescript
import { checkAndGetEnvValue } from '@kikiutils/shared/env';

const apiKey = checkAndGetEnvValue('API_KEY');
```

### Date ranges

```typescript
import { getDateRangeFromDate } from '@kikiutils/shared/datetime';

const range = getDateRangeFromDate(new Date(), 'thisWeek', { weekStartsOn: 1 });
console.log(range.startDate, range.endDate);
```

### Precise numeric display

```typescript
import { PrecisionNumber } from '@kikiutils/shared/classes/precision-number';
import { toPercentageString } from '@kikiutils/shared/math';

const amount = new PrecisionNumber('1.239', 2).plus('2.111');
console.log(amount.toString()); // 3.35
console.log(toPercentageString(1, 3, { decimalPlaces: 2 })); // 33.33%
```

### Browser redirect preservation

```typescript
import { appendRedirectParamToUrl } from '@kikiutils/shared/url';

const loginUrl = appendRedirectParamToUrl('/login', '/dashboard?tab=home');
// /login?redirect=%2Fdashboard%3Ftab%3Dhome
```

### LRU keyed store

```typescript
import { createLruKeyedStore } from '@kikiutils/shared/storages/lru/keyed-store';
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, { name: string }>({ max: 100 });
const users = createLruKeyedStore<{ name: string }>(cache)((id: string) => `user:${id}`);

users.setItem({ name: 'Alice' }, '1');
console.log(users.getItem('1')); // { name: 'Alice' }
```

## Optional peer dependencies

Most modules are tiny wrappers around platform APIs or optional peers. If your package manager does not auto-install peers, add the ones you import:

| Module | Peer dependency |
| --- | --- |
| `crypto-hash` / `hash` | `@noble/hashes` for `hash`; Node `crypto` for `crypto-hash` |
| `datetime` | `date-fns` |
| `element-plus` | `async-validator`, `element-plus` |
| `classes/precision-number`, `math` | `decimal.js` |
| `number` | `millify` |
| `consola` | `consola` |
| `pino` | `pino`, `pino-pretty` |
| `storages/lru/keyed-store` | `lru-cache` |
| `storages/redis/msgpack` | `msgpackr` |
| `vue` | `vue`, `vue-router` |

## Development

```bash
pnpm install
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-href]: https://npmjs.com/package/@kikiutils/shared
[npm-version-src]: https://img.shields.io/npm/v/@kikiutils/shared/latest.svg?colorA=18181b&colorB=28cf8d&style=flat

[npm-downloads-href]: https://npmjs.com/package/@kikiutils/shared
[npm-downloads-src]: https://img.shields.io/npm/dm/@kikiutils/shared.svg?colorA=18181b&colorB=28cf8d&style=flat

[codecov-href]: https://codecov.io/gh/kikiutils/node-shared
[codecov-src]: https://codecov.io/gh/kikiutils/node-shared/graph/badge.svg?token=GRSQ7JO39E

[license-href]: https://github.com/kikiutils/node-shared/blob/main/LICENSE
[license-src]: https://img.shields.io/github/license/kikiutils/node-shared?colorA=18181b&colorB=28cf8d&style=flat
