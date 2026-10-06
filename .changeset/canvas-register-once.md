---
"@raisins/react": minor
---

Add `registerOnce(owner, register)` to `CanvasScopeMolecule` and use it in the built-in canvas plugins. bunshi re-runs molecule bodies on every lookup, so registering renderers, appenders, HTML and listeners with plain `add` calls stacked a duplicate on every render. Plugins that register from a molecule body should wrap their `add` calls in `registerOnce`, keyed by their own molecule.
