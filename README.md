# @kikiutils/shared

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

待整理

- [✨ Release Notes](./CHANGELOG.md)

## Features

待整理

## Requirements

- **Node.js** `>=24.15.0`
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
