# Raisin JS

Likes GrapesJS but more DRY

## TODO

- Canvas drag and drop
- Expand / Collapse layer children tree
- Restrictions on drag and drop (valid drop location / hide invalid drops)
- Drag new blocks from the sidebar
- Adapter pattern so that Editors can be supplied by E.g. React Portal
- Remove empty text nodes / whitespace

## Bugs

- Typing too fast in the attribute editor OR the canvas does not register all input. It only gets the last one. To reproduce press 4 keys at the exact same time. Only one of the keys will register. Also if you type quickly in the middle of a text input, the selection will jump to the end.
  -- his is likely performance-related, since stencil starter and react don't have the same problem.
  -- ~~Maybe this is related to stencil hooks, and the delayed re-render via forceUpdate?~~ - Nope, tested simple textbox 4 key smash with both vanilla stencil state, and stencil hooks state -- but could still be related.

- Selected node is cached in state on undo/redo sometimes, but probably shouldn't be
