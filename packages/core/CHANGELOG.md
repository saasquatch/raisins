# Changelog

## [1.1.2] - 2024-01-18

### Updated

- Updated version of css-tree to match `@raisins/react`

## [1.1.1] - 2023-04-20

### Changed

- Updated license copyright to be in line with SaaSquatch open-source policy.

## [1.1.0] - 2022-07-21

### Updated

- Plop targets are now generated within the root
  - Allows for plopping components into empty HTML
- `moveNode` now supports plopping components without slot names into named slots
  - For example, the component \<my-component> can now be plopped into the "child" slot of \<my-container>, resulting in the following HTML:
  ```
  <my-container>
    <my-component slot="child" />
  </my-container>
  ```

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

[1.1.2]: https://github.com/saasquatch/raisins/releases/tag/core@1.1.2..core@1.1.1
[1.1.1]: https://github.com/saasquatch/raisins/releases/tag/core@1.1.1..core@1.1.0
[1.1.0]: https://github.com/saasquatch/raisins/releases/tag/core@1.1.0...core@1.0.1
[1.0.1]: https://github.com/saasquatch/raisins/releases/tag/core@1.0.1...core@1.0.0
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/core@1.0.0
