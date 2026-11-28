# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Node.js][node-src]][node-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

Modular utilities for TypeScript, including hashing, logging, dates, precise math, storage helpers, and Vue/web helpers. Each module is imported by its own subpath and needs only its own peer dependencies. ESM only.

- [✨ Release Notes](./CHANGELOG.md)

## Installation

```bash
pnpm add @kikiutils/shared
```

<!-- Drop this section if the package has no optional peer dependencies. -->
## Optional Peer Dependencies

| Package | Enables |
| --- | --- |
| `date-fns` | `datetime`, `classes/enhanced-date` |
| `decimal.js` | `math`, `classes/precision-number` |
| `element-plus` | `element-plus` |
| `file-type` | `file` |
| `lru-cache` | `storages/lru/keyed-store` |
| `msgpackr` | `storages/redis/msgpack` |
| `rotating-file-stream` | File rotation in `logger/node` |
| `vue`, `vue-router` | `vue` |

## Runtime Support

- **Node.js and Bun only:** `buffer`, `crypto-hash`, `env`, `logger/node`, `redis/*`, `storages/redis/bun-adapter`, `classes/path`
- **Browser only:** `clipboard`, `web`
- Everything else works in Node.js, Bun, and browsers.

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-href]: https://npmjs.com/package/@kikiutils/shared
[npm-version-src]: https://img.shields.io/npm/v/@kikiutils/shared/latest.svg?colorA=18181b&colorB=28cf8d&style=flat

[npm-downloads-href]: https://npmjs.com/package/@kikiutils/shared
[npm-downloads-src]: https://img.shields.io/npm/dm/@kikiutils/shared.svg?colorA=18181b&colorB=28cf8d&style=flat

[node-href]: ./package.json
[node-src]: https://img.shields.io/node/v/@kikiutils/shared?colorA=18181b&colorB=28cf8d&style=flat

[codecov-href]: https://codecov.io/gh/kikiutils/node-shared
[codecov-src]: https://codecov.io/gh/kikiutils/node-shared/graph/badge.svg?token=GRSQ7JO39E

[license-href]: https://github.com/kikiutils/node-shared/blob/main/LICENSE
[license-src]: https://img.shields.io/github/license/kikiutils/node-shared?colorA=18181b&colorB=28cf8d&style=flat
