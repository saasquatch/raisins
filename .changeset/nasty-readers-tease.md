---
"@raisins/react": patch
"@raisins/core": patch
---

@raisins/react: Adds `PersistedHtmlAtom`, the html to save or export — the document with per-instance CSS appended as a managed `<style>` node. Read it instead of `HTMLAtom` anywhere html leaves the editor.
@raisins/core: Escape early `</style>` sequences when serializing `<style>` contents to prevent raw-text HTML injection during HTML round-tripping.
