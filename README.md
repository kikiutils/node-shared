# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A lightweight and modular utility library for modern JavaScript and TypeScript — includes secure hashing, flexible logging, datetime tools, Vue/web helpers, storage abstraction, and more.

- [✨ Release Notes](./CHANGELOG.md)

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

## Modules

```
src/
├── classes/           # Class-based utilities
│   ├── path.ts        # Path manipulation
│   ├── precision-number.ts # Decimal.js wrapper
│   └── ssh-client.ts  # SSH client
│
├── storages/
│   ├── lru/keyed-store.ts    # LRU cache wrapper
│   └── redis/
│       ├── keyed-store.ts     # Redis keyed store
│       ├── msgpack.ts         # Redis + msgpack
│       └── types.ts           # Storage interfaces
│
└── *.ts              # Utility functions (see table)
```

| File | Description |
|------|-------------|
| `buffer.ts` | Binary → Node.js Buffer |
| `clipboard.ts` | Clipboard API (browser) |
| `consola.ts` | Consola logger |
| `crypto-hash.ts` | MD5, SHA3 (Node) |
| `datetime.ts` | date-fns wrappers |
| `element-plus.ts` | Element Plus form rules |
| `enum.ts` | Enum value extractors |
| `env.ts` | Env var accessor |
| `event-awaiter.ts` | Async event wait |
| `general.ts` | extractFirstValue |
| `hash.ts` | SHA3 (browser) |
| `math.ts` | toPercentageString |
| `number.ts` | toCompactNumberString |
| `object.ts` | deterministic stringify |
| `pino.ts` | Pino logger |
| `random.ts` | nested random length |
| `string.ts` | randomString |
| `time.ts` | abortableDelay |
| `url.ts` | redirect param |
| `vue.ts` | Vue composables |
| `web.ts` | Web DOM helpers |

## Usage

```typescript
import { logger } from '@kikiutils/shared/consola';
import { extractFirstValue } from '@kikiutils/shared/general';

const data = [
    0,
    1,
];

const value = extractFirstValue(data);
console.log(value); // 0
logger.info(value);
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
