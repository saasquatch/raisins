# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2022-06-08

### Added

- Initial release of raisins editor

- Controllers

  - `AttributesController`
  - `BasicCanvasController`
  - `CanvasController`
  - `SelectedNodeController`
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

[unreleased]: https://github.com/saasquatch/raisins/compare/react@1.0.0...HEAD
[1.0.0]: https://github.com/saasquatch/raisins/releases/tag/react@1.0.0
