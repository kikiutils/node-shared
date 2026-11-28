# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

- [✨ Release Notes](./CHANGELOG.md)

## Features

待整理

## Requirements

- **Node.js** `>=24.15.0`
- **ESM** package (`"type": "module"`)

## Installation

Using [pnpm](https://pnpm.io):

```bash
pnpm add @kikiutils/shared
```

You can also use `npm`, `yarn`, or `bun`.

> [!NOTE]
> This package is intentionally modular. Imports such as `@kikiutils/shared/datetime` or `@kikiutils/shared/vue` may require their peer dependencies (`date-fns`, `vue`, and so on). Install only the peers used by your chosen modules.

## Runtime support

- **Node.js and Bun only:** `buffer`, `crypto-hash`, `env`, `logger/node`, `redis/*`, `storages/redis/bun-adapter`, `classes/path`
- **Browser only:** `clipboard`, `web`
- **Vue with Vue Router:** `vue`
- Everything else works in Node.js, Bun, and browsers.

Known Bun differences surface through `Path`, which follows Bun's `node:fs` behavior:

- `fs.promises.access()` resolves `null` instead of `undefined`.
- `readdir` with `{ encoding: 'buffer', withFileTypes: true }` returns entries without `name` or `isFile()`.

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
