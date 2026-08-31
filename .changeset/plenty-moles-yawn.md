---
'@raisins/core': minor
---

`calculatePlopTargets` now validates `validParents` for an empty root, instead of unconditionally
returning a single top-level target. A component restricted to a specific parent no longer gets a
free drop target at the top level of an empty document.
