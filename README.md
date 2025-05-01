# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

A modular utility library for Node.js offering secure hashing, flexible logging, datetime manipulation, and more.

- [✨ Release Notes](./CHANGELOG.md)

## Features

- 📜 Simple and flexible logging with Consola and Pino
- 🔒 Secure hash utilities: MD5, SHA3-224, SHA3-256, SHA3-384, SHA3-512
- 📅 Datetime utilities for formatting, ranges, and offsets
- 🔢 Enum helpers to extract values
- 🌱 Environment variable checker with error handling
- 📈 Math utilities like percentage formatting
- 💎 Number formatting utilities (e.g. compact representation)
- 🔤 String tools such as random string generation
- ⚙️ General-purpose utilities like value extractors
- 📦 Modular by design — import only what you need via `@kikiutils/shared/<module>`

## Requirements

- **Node.js** `>= 18.12.1`

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

### [consola](./src/consola.ts)

- Console logger integration

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

### [enum](./src/enum.ts)

- `getEnumStringValues`
- `getEnumNumberValues`

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

### [pino](./src/pino.ts)

- Pino logger integration

### [random](./src/random.ts)

- `generateWithNestedRandomLength`

### [string](./src/string.ts)

- `randomString`

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
