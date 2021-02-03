# Raisin JS

Likes GrapesJS but more DRY

## TODO

- Adapter pattern so that Editors can be supplied by E.g. React Portal
- Serialization / adapter back to DomHandler

## Bugs

- Typing too fast in the attribute editor OR the canvas does not register all input. It only gets the last one. To reproduce press 4 keys at the exact same time. Only one of the keys will register. Also if you type quickly in the middle of a text input, the selection will jump to the end.
  -- his is likely performance-related, since stencil starter and react don't have the same problem.
  -- ~~Maybe this is related to stencil hooks, and the delayed re-render via forceUpdate?~~ - Nope, tested simple textbox 4 key smash with both vanilla stencil state, and stencil hooks state -- but could still be related.

- Drag and Drop no longer updates DepthLabels until AFTER drop, and then it stays around. Likely this was caused from the new immutable RaisinNode refactor causing fewer explicit re-renders.

- Editting text inside a selected DIV causes the div to be unselected. But editing inside a selected SPAN does not cause the span to be unselected?

- Selected node is cached in state on undo/redo sometimes, but probably shouldn't be
