---
"@raisins/stencil-docs-target": major
---

Ship as dual ESM/CJS with an `exports` map (built with tsdown); deep imports into `dist/` are no longer supported. Declare `@stencil/core` (`>=1`) as a peer dependency and require Node 14 or later. String-literal defaults (`"Friend"`, `'Friend'`, `` `Friend` ``) are decoded to their value instead of keeping their quotes on Stencil 4 or failing the build on Stencil 2, and a `@default` that Stencil copies from a non-string initializer is emitted as attribute text (`"6"`, `"false"`).
