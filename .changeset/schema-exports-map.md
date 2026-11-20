---
"@raisins/schema": minor
---

Add an `exports` map. The documented entry points (`@raisins/schema` → `schema.json`, `@raisins/schema/schema` → types) and the `./schema.json` and `./package.json` paths still resolve. Model types in `schema.d.ts` are now declared as `interface`s instead of `type` aliases.
