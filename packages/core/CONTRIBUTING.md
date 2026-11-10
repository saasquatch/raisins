# Raisins Core

## Commands

Source lives in `/src`.

- `npm start` — builds to `/dist` with [tsdown](https://tsdown.dev) in watch mode, rebuilding on every change in `src`.
- `npm run build` — one-off build to `/dist` (CJS + ESM, with type declarations and sourcemaps).
- `npm test` — runs the [Vitest](https://vitest.dev) `node` project (`*.iso.test.ts` and `*.node.test.ts`, in jsdom).
- `npm run test:browser` — runs the Vitest `browser` project (`*.iso.test.ts` and `*.web.test.ts`) in headless Chromium via Playwright. Run `npx playwright install --only-shell chromium` once first.
- `npm run test:watch` — runs both projects in watch mode; `npm run test:coverage` collects coverage for the `node` project.
- `npm run lint` — lints with [oxlint](https://oxc.rs/docs/guide/usage/linter) (type-aware, using `tsconfig.json`).
- `npm run format` — formats with [oxfmt](https://oxc.rs/docs/guide/usage/formatter).

### Tests

- `*.iso.test.ts` run in both projects, `*.node.test.ts` only in jsdom, and `*.web.test.ts` only in the browser.
- Gherkin `.feature` files are bound to step definitions in `src/cucumber-steps` with `bindIsomorphicCucumberSteps`, which takes the feature text from a `?raw` import so it works in both projects.

### TypeScript

`tsconfig.json` is used for type checking only (`noEmit`); tsdown handles the build. It uses `nodenext` module resolution, so relative imports must include the `.ts` extension, and type-only imports must use `import type` (`verbatimModuleSyntax`).

## Module Formats

The package ships CJS (`dist/index.cjs`) and ESM (`dist/index.mjs`) builds, selected through the `exports` map in `package.json`.

## Publishing

- Confirm all tests pass with `npm run test`
- Build with `npm run build`
- Update the package version and run `npm run publish`
- tag with the newly published version: `git tag @raisins/core@[your-version]` and `git push origin --tags`
