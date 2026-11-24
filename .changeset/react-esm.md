---
"@raisins/react": major
---

Publish as an ES module with an `exports` map (built with tsdown); deep imports into `dist/` and `src/` are no longer supported, and `require("@raisins/react")` needs a runtime that supports `require(esm)` (Node 20.19+/22.12+). The `SnabbdomRenderer` and `AttributeTemplateProps` types, previously only reachable through `dist/` paths, are now exported from the package root. Raise the `prosemirror-view` floor to `^1.42.9` to pick up security fixes. Drop the unused `valtio` and `css-tree` dependencies.
