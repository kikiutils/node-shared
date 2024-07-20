# @kikiutils/node

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Useful functions, constants, etc.

- [✨ Release Notes](./CHANGELOG.md)

## Features

- ✔️ Provides SHA-3 related hash functions, date formatting handling, and more
- ✔️ TypeScript support

## Environment Requirements

- Node.js version 18 or higher

## Installation

Add dependency (example using pnpm).

```bash
pnpm add @kikiutils/node
```

You can also use yarn, npm, or bun to add the dependency.

That's it! You're ready to use this package in your project. Check out the instructions for [functions](#functions) below. ✨

## Functions

Some functions or the top of files will have related comments and examples.

- [crypto-hash](./src/crypto-hash.ts)
  - cryptoSha3224
  - cryptoSha3224ToBuffer
  - cryptoSha3256
  - cryptoSha3256ToBuffer
  - cryptoSha3384
  - cryptoSha3384ToBuffer
  - cryptoSha3512
  - cryptoSha3512ToBuffer

- [datetime](./src/datetime.ts)
  - formatDateOrTimestamp
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

- [logger](./src/logger.ts)
- [math](./src/math.ts)
  - calculateToPercentageString

- [number](./src/number.ts)
  - prettyNumberToString

- [object](./src/object.ts)
  - ksort

- [request](./src/request.ts)
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
