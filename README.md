# @kikiutils/node

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

Utility functions, constants, tools, etc.

- [✨ Release Notes](./CHANGELOG.md)

## Installation

```bash
# Using pnpm
pnpm add @kikiutils/node

# Using yarn
yarn add @kikiutils/node

# Using npm
npm i @kikiutils/node

# Using bun
bun add @kikiutils/node
```

## Environmental Requirements

- ESM only
- Node.js 18 or higher

## Functions

The relevant comments are at the top of the file or on functions and constants.

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
