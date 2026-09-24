---
"@raisins/react": patch
"@raisins/core": patch
---

@raisins/react: Adds a setter atom to persist raisins-managed css into the root node of the document.
@raisins/core: Escape early `</style>` sequences when serializing `<style>` contents to prevent raw-text HTML injection during HTML round-tripping.
