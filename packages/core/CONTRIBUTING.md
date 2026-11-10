# Raisins Core

## Commands

Source lives in `/src`.

- `npm start` — builds to `/dist` with [tsdown](https://tsdown.dev) in watch mode, rebuilding on every change in `src`.
- `npm run build` — one-off build to `/dist` (CJS + ESM, with type declarations and sourcemaps).
- `npm test` — runs the Jest suite (`*.iso.test.ts` and `*.node.test.ts`). Use `npm run test:watch` or `npm run test:coverage` as needed.
- `npm run lint` — lints with [oxlint](https://oxc.rs/docs/guide/usage/linter) (type-aware, using `tsconfig.json`).
- `npm run format` — formats with [oxfmt](https://oxc.rs/docs/guide/usage/formatter).
- `npm run cypress:open` — runs the browser (`*.web.test.ts` and `.feature`) specs in Cypress.

### TypeScript

`tsconfig.json` is used for type checking only (`noEmit`); tsdown handles the build. It uses `nodenext` module resolution, so relative imports must include the `.ts` extension, and type-only imports must use `import type` (`verbatimModuleSyntax`).

## Module Formats

The package ships CJS (`dist/index.cjs`) and ESM (`dist/index.mjs`) builds, selected through the `exports` map in `package.json`.

## Publishing

- Confirm all tests pass with `npm run test`
- Build with `npm run build`
- Update the package version and run `npm run publish`
- tag with the newly published version: `git tag @raisins/core@[your-version]` and `git push origin --tags`
