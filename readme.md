# Raisin JS

Likes GrapesJS but more DRY

## TODO

- Adapter pattern so that Editors can be supplied by E.g. React Portal
- Serialization / adapter back to DomHandler

## Bugs

- Typing too fast in the attribute editor OR the canvas does not register all input. It only gets the last one. This is likely performance-related, since stencil starter and react don't have the same problem. To reproduce press 4 keys at the exact same time. Only one of the keys will register. Also if you type quickly in the middle of a text input, the selection will jump to the end.
