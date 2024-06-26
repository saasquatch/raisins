# Changelog

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
