# Changelog

## 2.0.0

### Major Changes

- [#57](https://github.com/saasquatch/raisins/pull/57) [`b804b8b`](https://github.com/saasquatch/raisins/commit/b804b8b17581d6d6eae5b6adf33c20ed49b3b74b) Thanks [@ashley-osuna](https://github.com/ashley-osuna)! - Ship as dual ESM/CJS with an `exports` map (built with tsdown); deep imports into `dist/` are no longer supported. Declare `@stencil/core` (`>=1`) as a peer dependency and require Node 14 or later. String-literal defaults (`"Friend"`, `'Friend'`, `` `Friend` ``) are decoded to their value instead of keeping their quotes on Stencil 4 or failing the build on Stencil 2, and a `@default` that Stencil copies from a non-string initializer is emitted as attribute text (`"6"`, `"false"`).

### Patch Changes

- Updated dependencies [[`d64de29`](https://github.com/saasquatch/raisins/commit/d64de29d8f89dc96e140686da3f83bc54e5df70e)]:
  - @raisins/schema@1.5.0

## 1.4.0

### Minor Changes

- [#35](https://github.com/saasquatch/raisins/pull/35) [`ba862bb`](https://github.com/saasquatch/raisins/commit/ba862bbe2257ab5032e4c81a7bafeca5200a0e92) Thanks [@Locrian24](https://github.com/Locrian24)! - @raisins/schema: Add CustomElement.cssParts field and the CssPart type so components can declare the ::part(name) surfaces they expose for styling.

  @raisins/stencil-docs-target: Emit cssParts and cssProperties from Stencil's @csspart / @cssprop JSDoc tags when converting component docs.

  @raisins/core: Add scopeStylesheet(), which rewrites :host, :host(<sel>), ::part(name), bare selectors a stylesheet applies only to a scoped element. Also add an optional cloneNode argument to htmlUtil.duplicate() so callers can customize cloned nodes (e.g., assign new ids).

  @raisins/react: Add CssEditingMolecule, StyleMolecule + StylePanel (per-:host and per-::part section editors), and DocumentCssMolecule + DocumentCssEditor for page-wide CSS.

### Patch Changes

- Updated dependencies [[`ba862bb`](https://github.com/saasquatch/raisins/commit/ba862bbe2257ab5032e4c81a7bafeca5200a0e92)]:
  - @raisins/schema@1.4.0

## 1.3.0

### Minor Changes

- [#37](https://github.com/saasquatch/raisins/pull/37) [`c9dcffc`](https://github.com/saasquatch/raisins/commit/c9dcffce45b6ab34f3816782890e672c66db4520) Thanks [@00salmon](https://github.com/00salmon)! - Propagate the `@hidden` JSDoc tag from Stencil component classes onto the generated raisins meta as `hidden: true`. Pairs with the new `CustomElement.hidden` schema field.

### Patch Changes

- Updated dependencies [[`c9dcffc`](https://github.com/saasquatch/raisins/commit/c9dcffce45b6ab34f3816782890e672c66db4520)]:
  - @raisins/schema@1.3.0

## 1.2.1

### Patch Changes

- [#33](https://github.com/saasquatch/raisins/pull/33) [`91c7885`](https://github.com/saasquatch/raisins/commit/91c7885a435aa316d25062e0e1f34f469dcb67f7) Thanks [@00salmon](https://github.com/00salmon)! - Added new @requiredFlavor jsdoc to stencil-docs-target and schema

- Updated dependencies [[`91c7885`](https://github.com/saasquatch/raisins/commit/91c7885a435aa316d25062e0e1f34f469dcb67f7)]:
  - @raisins/schema@1.2.1

## 1.2.0

### Minor Changes

- [#28](https://github.com/saasquatch/raisins/pull/28) [`df59327`](https://github.com/saasquatch/raisins/commit/df59327345c57e7b6ca0a41a25b566d5e66bf8a0) Thanks [@Locrian24](https://github.com/Locrian24)! - Add support for component states as well as various updates to support states in the raisins editor

### Patch Changes

- Updated dependencies [[`df59327`](https://github.com/saasquatch/raisins/commit/df59327345c57e7b6ca0a41a25b566d5e66bf8a0)]:
  - @raisins/schema@1.2.0

## 1.1.1

### Patch Changes

- [#24](https://github.com/saasquatch/raisins/pull/24) [`c446297`](https://github.com/saasquatch/raisins/commit/c4462972a42b401ca313ca6b63e9ee34b610084d) Thanks [@00salmon](https://github.com/00salmon)! - Includes example group with example blocks to allow examples that don't have the component as the wrapper to be properly grouped

- Updated dependencies [[`c446297`](https://github.com/saasquatch/raisins/commit/c4462972a42b401ca313ca6b63e9ee34b610084d)]:
  - @raisins/schema@1.1.1

## 1.1.0

### Minor Changes

- [#16](https://github.com/saasquatch/raisins/pull/16) [`cae0203`](https://github.com/saasquatch/raisins/commit/cae02034bca4a139c761d876d2da22ac42564857) Thanks [@Locrian24](https://github.com/Locrian24)! - Added support for feature enforcement tags on components

### Patch Changes

- Updated dependencies [[`cae0203`](https://github.com/saasquatch/raisins/commit/cae02034bca4a139c761d876d2da22ac42564857)]:
  - @raisins/schema@1.1.0

## [1.0.1] - 2023-04-20

### Changed

- Updated license copyright to be in line with SaaSquatch open-source policy.

## [1.0.0] - 2022-06-06

### Added

- Supports JSDocs tags for customizing the editability of stencil components
  - Attribute Tags:
    - `@undocumented`
    - `@uiName`
    - `@uiType`
    - `@default`
    - `@required`
    - `@uiEnum`
    - `@uiEnumNames`
    - `@uiWidget`
    - `@uiWidgetOptions`
    - `@maximum`
    - `@minimum`
    - `@maxLength`
    - `@minLength`
    - `@format`
    - `@uiGroup`
    - `@uiOrder`
      - Note: uiOrder is picked up by the stencildocs target but not utilized in the raisins editor at the moment.
- Element Tags:
  - `@undocumented`
  - `@uiName`
  - `@slots`
  - `@exampleGroup`
  - `@example`
  - `@validParents`
  - `@slotEditor`
  - `@canvasRenderer`

[1.0.1]: https://github.com/saasquatch/raisins/releases/tag/stencil-docs-target@1.0.1
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/stencil-docs-target@1.0.0
