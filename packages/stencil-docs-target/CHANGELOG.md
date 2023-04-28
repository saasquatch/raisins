# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/saasquatch/raisins/compare/stencil-docs-target@1.0.1...HEAD
[1.0.1]: https://github.com/saasquatch/raisins/releases/tag/stencil-docs-target@1.0.1
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/stencil-docs-target@1.0.0
