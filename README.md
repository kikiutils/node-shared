# @kikiutils/node

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
- 📦 Modular by design — import only what you need via `@kikiutils/node/<module>`

## Requirements

- **Node.js** `>= 18.12.1`

## Installation

Using [pnpm](https://pnpm.io):

```bash
pnpm add @kikiutils/node
```

You can also use `yarn`, `npm`, or `bun`.

> [!NOTE]
> This package is modular. It does not install all dependencies by default.
>
> If a utility depends on a third-party package (e.g. `date-fns`), you must install it manually.

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

### [string](./src/string.ts)

- `randomString`

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-href]: https://npmjs.com/package/@kikiutils/node
[npm-version-src]: https://img.shields.io/npm/v/@kikiutils/node/latest.svg?style=flat&colorA=18181B&colorB=28CF8D

[npm-downloads-href]: https://npmjs.com/package/@kikiutils/node
[npm-downloads-src]: https://img.shields.io/npm/dm/@kikiutils/node.svg?style=flat&colorA=18181B&colorB=28CF8D

[codecov-href]: https://codecov.io/github/kikiutils/node
[codecov-src]: https://codecov.io/github/kikiutils/node/graph/badge.svg?token=GRSQ7JO39E

[license-href]: https://github.com/kikiutils/node/blob/main/LICENSE
[license-src]: https://img.shields.io/npm/l/@kikiutils/node.svg?style=flat&colorA=18181B&colorB=28CF8D
