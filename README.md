# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A lightweight and modular utility library for modern JavaScript and TypeScript — includes secure hashing, flexible logging, datetime tools, Vue/web helpers, storage abstraction, and more.

- [✨ Release Notes](./CHANGELOG.md)

TODO: update README

## Features

- 📋 Clipboard utilities — copy text and blobs using the modern Clipboard API (Browser only)
- 📜 Logging utilities — simple and extensible logging via Consola and Pino
- 🔒 Crypto utilities — secure hashing functions: MD5, SHA3-224/256/384/512
- 📅 Datetime utilities — manipulate, format, and offset dates and ranges
- 🔢 Enum utilities — extract enum keys and values (number or string)
- 🌱 Environment helpers — safe env var access with error handling (Node only)
- 📈 Math utilities — rounding, formatting percentages, and ratios
- 💎 Number utilities — number padding, compact display, currency formatting
- 🔤 String utilities — casing, trimming, random string generation, etc.
- 🌐 URL utilities — parse and construct query strings and redirect URLs
- 🧩 Vue 3 utilities — composables like scroll preservation and key handling
- 🖥️ Web utilities — browser DOM helpers (e.g. scroll to top, key matching)
- 🗄️ Storage utilities — enhanced localStorage, Redis, and LRU abstractions
- 📦 Modular by design — import only what you need via `@kikiutils/shared/<module>`

## Requirements

- **Node.js** `>=22.12.0`

## Installation

Using [pnpm](https://pnpm.io):

```bash
pnpm add @kikiutils/shared
```

You can also use `yarn`, `npm`, or `bun`.

> [!NOTE]
> This package is modular. It does not install all dependencies by default.
>
> If a utility depends on a third-party package (e.g. `date-fns`), you must install it manually.

## Usage

Import the functions or modules you want to use:

```typescript
import { logger } from '@kikituils/shared/consola';
import { extractFirstValue } from '@kikituils/shared/general';

const data = [
    0,
    1
];

const value = extractFirstValue(data);
console.log(value); // 0
logger.info(value);
```

## Modules & Functions

Each module file includes function-level comments and usage examples.

### [buffer](./src/buffer.ts)

- `toBuffer`

### [clipboard](./src/clipboard.ts)

- `copyBlobToClipboard`
- `copyTextToClipboard`

### [consola](./src/consola.ts)

Console logger integration.

### [crypto-hash](./src/crypto-hash.ts)

- `cryptoMd5`, `cryptoMd5ToBuffer`
- `cryptoSha3224`, `cryptoSha3224ToBuffer`
- `cryptoSha3256`, `cryptoSha3256ToBuffer`
- `cryptoSha3384`, `cryptoSha3384ToBuffer`
- `cryptoSha3512`, `cryptoSha3512ToBuffer`

### [datetime](./src/datetime.ts)

- `formatDate`
- `getDateRangeFromDate`
- `getMidnightDateFromToday`

### [element-plus](./src/element-plus.ts)

- `createElFormItemRuleWithDefaults`

### [enum](./src/enum.ts)

- `getEnumStringValues`
- `getEnumNumberValues`
- `getEnumValues`

### [env](./src/env.ts)

- `checkAndGetEnvValue`

### [general](./src/general.ts)

- `extractFirstValue`

### [hash](./src/hash.ts)

- `sha3224`
- `sha3256`
- `sha3384`
- `sha3512`

### [math](./src/math.ts)

- `toPercentageString`

### [number](./src/number.ts)

- `toCompactNumberString`

### [object](./src/object.ts)

- `stringifyObjectDeterministically`

### [pino](./src/pino.ts)

Pino logger integration.

### [random](./src/random.ts)

- `generateWithNestedRandomLength`

### storage

#### [enhanced-local](./src/storage/enhanced/local/index.ts)

- `createKeyedEnhancedLocalStore`
- `enhancedLocalStorage`

#### [enhanced-redis](./src/storage/enhanced/redis/index.ts)

- `createEnhancedRedisStorage`
- `createKeyedEnhancedRedisStore`

#### [lru/keyed-store](./src/storage/lru/keyed-store.ts)

- `createKeyedLruStore`

### [string](./src/string.ts)

- `randomString`

### [url](./src/url.ts)

- `appendRedirectParamToUrl`

### [vue](./src/vue.ts)

- `appendRedirectParamFromCurrentRouteToUrl`
- `clearIntervalRef`
- `clearTimeoutRef`
- `usePreserveScroll`

### [web](./src/web.ts)

- `appendRedirectParamFromCurrentLocationToUrl`
- `assignUrlWithRedirectParamFromCurrentLocation`

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
