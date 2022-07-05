# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2022-06-16

- Fixed regex bug in Safari

## [1.0.0] - 2022-06-09

### Added

- Initial release of raisins core

- Available Hooks:
  - HTML Utilities
    - `htmlSerializer`
    - `htmlParser`
    - `htmlUtil`
      - included utility functions:
      - `getParents`
      - `visit`
      - `remove`
      - `removePath`
      - `duplicate`
      - `replace`
      - `replacePath`
      - `move`
      - `moveToPath`
      - `moveNode`
      - `insertAt`
      - `insertAtPath`
      - `removeWhitespace`
      - `visitAll`
      - `clone`
      - `getAncestry`
  - Node types
    - `isNodeWithChildren`
    - `isElementNode`
    - `isRoot`
    - `isStyleNode`
    - `isTextNode`
    - `isCommentNode`
    - `isDirectiveNode`
  - Validation
    - `getSlots`
    - `doesChildAllowParent`
    - `doesParentAllowChild`
    - `isNodeAllowed`
    - `HTMLComponents`
    - `DefaultTextMarks`
    - `validateNode`
    - `validateChildConstraints`
    - `generateJsonPointers`
    - `validateAttributes`
    - `getSubErrors`
    - `hasSubErrors`
    - `removeError`
    - `calculatePlopTargets`
  - Path / selection
    - `getNode`
    - `getPath`
  - CSS
    - `cssSerializer`
    - `cssParser`
    - `cssUtil`
    - `cssSelector`

[unreleased]: https://github.com/saasquatch/raisins/compare/core@1.0.0...HEAD
[1.0.1]: https://github.com/saasquatch/raisins/releases/tag/core@1.0.1...core@1.0.0
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/core@1.0.0
