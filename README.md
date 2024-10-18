# @kikiutils/node

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

A utility library offering easy-to-use HTTP request wrappers, secure hash functions, flexible logging, datetime utilities, and more to simplify Node.js development.

- [✨ Release Notes](./CHANGELOG.md)

## Features

- ✔️ Easy-to-use Axios wrappers for common HTTP methods
- 📜 Flexible and efficient console logging with Consola
- 🔒 Secure hash functions including MD5, SHA3-224, SHA3-256, SHA3-384, and SHA3-512
- 📅 Handy datetime utilities for formatting and manipulation
- 🔢 Enum helpers for extracting string and number values
- 🌱 Environment variable checker to ensure required values are set
- 🛡️ Middleware for logging in Hono framework
- 📈 Simple math utility for percentage calculations
- 💎 Utility for formatting numbers prettily
- 📜 Pino logging integration for enhanced log management
- 🔤 String utilities for generating random alphabetic strings

## Environment Requirements

- Node.js version 18 or higher

## Installation

Add dependency (example using pnpm).

```bash
pnpm add @kikiutils/node
```

You can also use yarn, npm, or bun to add the dependency.

That's it! You're ready to use this package in your project. Check out the [function instructions](#functions) below ✨.

> [!NOTE]
> When installing this package, not all required dependencies will be installed. If a function uses specific functionalities, you will need to install the corresponding dependencies manually.
>
> For example, if there is a file that uses axios, you will need to manually install axios.

## Functions

Some functions or the top of files will have related comments and examples.

- [axios](./src/axios.ts)
  - axiosInstance
  - axiosRequest
  - axiosDelete
  - $axiosDelete
  - axiosGet
  - $axiosGet
  - axiosPatch
  - $axiosPatch
  - axiosPost
  - $axiosPost
  - axiosPut
  - $axiosPut

- [consola](./src/consola.ts)
- [crypto-hash](./src/crypto-hash.ts)
  - cryptoMD5
  - cryptoMD5ToBuffer
  - cryptoSHA3224
  - cryptoSHA3224ToBuffer
  - cryptoSHA3256
  - cryptoSHA3256ToBuffer
  - cryptoSHA3384
  - cryptoSHA3384ToBuffer
  - cryptoSHA3512
  - cryptoSHA3512ToBuffer

- [datetime](./src/datetime.ts)
  - formatDateOrTimestamp
  - getDateRangeFromDate
  - getMidnightDateFromToday

- [enum](./src/enum.ts)
  - getEnumNumberValues
  - getEnumStringValues

- [env](./src/env.ts)
  - checkAndGetEnvValue

- [hash](./src/hash.ts)
  - sha3224
  - sha3256
  - sha3384
  - sha3512

- [hono](./src/hono.ts)
  - useHonoLogger

- [index](./src/index.ts)
  - flattenToSingleValue
  - setReadonlyConstantToGlobalThis

- [math](./src/math.ts)
  - calculateToPercentageString

- [number](./src/number.ts)
  - prettyNumberToString

- [pino](./src/pino.ts)
- [string](./src/string.ts)
  - randomAlphabeticString
  - randomLowerCaseAlphabeticString

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@kikiutils/node/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/@kikiutils/node

[npm-downloads-src]: https://img.shields.io/npm/dm/@kikiutils/node.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/@kikiutils/node

[license-src]: https://img.shields.io/npm/l/@kikiutils/node.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/kiki-kanri/kikiutils-node/blob/main/LICENSE
