---
'@raisins/react': minor
---

Add native HTML drag-and-drop as a first-class alternative to click-based pick-and-plop.

- New `DragAndDropMolecule` (`DraggedAtom`, `DraggedNodeAtom`, `DraggedContentAtom`,
  `DraggingIsActive`, `LastHoveredPlopAtom`, `DropNodeInSlotAtom`, `TryCommitLastHoveredAtom`).
- New `drag-and-drop` entrypoint: `useDragBlock`, `useDragNode`, `useDragSelectedNode`,
  `useDropTarget` and the `DragHandle` drag-source primitive.
- New `CanvasDragAndDropMolecule` with `CanvasDragDropWrapper` / `useCanvasDragDrop`, which resolve
  drops from parent-side geometry so the sandboxed canvas iframe never has to receive drag events,
  and render a container highlight, insertion line and action pill.
- New `CanvasConfig.CustomPlopContainersAtom` for containers that lay out their own plop targets
  (e.g. tables rendering targets as column headers).
- `NodeMolecule.canPlopHereAtom` now validates against the dragged *or* picked candidate, via the
  new `PickAndPlopMolecule.PickedContentAtom`.
- Fix `NotFoundError` from snabbdom when non-shadow web components relocate their light-DOM
  children: the canvas now patches through a relocation-tolerant `DOMAPI`.
- Fix stale parent-side geometry: full snapshots (`GeometryDetail.full`) replace the cache instead
  of merging, so removed plop targets are evicted.
- Picked/dragged node paths now resolve leniently, so a dangling path after a document update
  yields `undefined` rather than throwing.
