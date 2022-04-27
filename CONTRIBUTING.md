# Contributing

- The packages are linked and released with [Lerna](https://lerna.js.org/)

## Getting Started

- Checkout the repo
- Install `npm i`
- Run `npx lerna bootstrap` in the root (Bootstrap the packages in the current Lerna repo. Installing all their dependencies and linking any cross-dependencies.)
- Build the packages you need `npm run build`
- Run a subproject, e.g. `cd packages/react-example && npm run start`
