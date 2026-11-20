---
"@raisins/core": major
---

Publish as an ES module with an `exports` map (built with tsdown). `require("@raisins/core")` needs a runtime that supports `require(esm)` (Node 20.19+/22.12+), and deep imports into `dist/` are no longer supported. Drop the `css` dependency, which carried high-severity advisories.
