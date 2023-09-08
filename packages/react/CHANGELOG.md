# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.3] - 2023-09-07

### Changed

- Updated default colors to new design standard

## [1.1.2] - 2023-05-16

### Changed

- Template tags now properly supported in raisins editors

## [1.1.1] - 2023-04-20

### Changed

- Updated license copyright to be in line with SaaSquatch open-source policy.

## [1.1.0] - 2022-07-21

### Updated

- Plop targets are now generated within the root
  - Extra margin was added to root plop targets to prevent them from getting cut off in the canvas
- New hook exported: `modulesToDetails`
  - Retrieves data from an npm package's `package.json` when given a `Module`

### Fixed

- Blocks that are moved into a named slot inherit the slot name so they are properly rendered
- all packages are loaded with `fast.ssqt.io/npm` instead of `unpkg.com` to prevent occasional loading issues

## [1.0.1] - 2022-06-16

- New version of `@raisins/core` dependency to fix safari regex bug

## [1.0.0] - 2022-06-09

### Added

- Initial release of raisins editor

- Controllers

  - `AttributesController`
  - `BasicCanvasController`
  - `CanvasController`
  - `SelectedNodeController`
  - `SelectedNodeRichTextEditor`
  - `NodeChildrenEditor`
  - `SlotChildrenController`
  - `ChildrenEditorForAtoms`
  - `ProseEditor`

- Hooks

  - `useHotkeys`

- Molecules

  - `AttributeMolecule`
  - `AttributeScopeMolecule`
  - `AttributesMolecule`
  - `CanvasConfigMolecule`
  - `CanvasScopeMolecule`
  - `ComponentModelMolecule`
  - `CoreMolecule`
  - `EditMolecule`
  - `EditSelectedMolecule`
  - `HistoryMolecule`
  - `ConfigMolecule`
  - `SoulsMolecule`
  - `HoveredNodeMolecule`
  - `PickAndPlopMolecule`
  - `SelectedNodeMolecule`
  - `HotkeysMolecule`
  - `NodeMolecule`
  - `NodeScopeMolecule`
  - `SlotScopeMolecule`
  - `SlotMolecule`
  - `ProseEditorStateMolecule`
  - `ProseToggleMarkMolecule`
  - `RichTextMolecule`

- Providers
  - `AttributeProvider`
  - `CanvasProvider`
  - `ConfigScopeProvider`
  - `RaisinsProvider`
  - `NodeScopeProvider`
  - `SlotScopeProvider`
  - `ProseEditorScopeProvider`

[unreleased]: https://github.com/saasquatch/raisins/compare/react@1.1.2...HEAD
[1.1.3]: https://github.com/saasquatch/raisins/compare/react@1.0.0...react@1.1.3
[1.1.2]: https://github.com/saasquatch/raisins/compare/react@1.0.0...react@1.1.2
[1.1.1]: https://github.com/saasquatch/raisins/compare/react@1.0.0...react@1.1.1
[1.1.0]: https://github.com/saasquatch/raisins/compare/react@1.0.0...react@1.1.0
[1.0.1]: https://github.com/saasquatch/raisins/compare/react@1.0.0...react@1.0.1
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/react@1.0.0
