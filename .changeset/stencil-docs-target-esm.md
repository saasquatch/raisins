---
"@raisins/stencil-docs-target": major
---

Ship as dual ESM/CJS with an `exports` map (built with tsdown); deep imports into `dist/` are no longer supported. Declare `@stencil/core` (`>=1`) as a peer dependency. With Stencil 4, string defaults are no longer emitted with literal quotes (`"\"Friend\""`), and a `@default` that Stencil copies from a non-string initializer is emitted as attribute text (`"6"`, `"false"`).
