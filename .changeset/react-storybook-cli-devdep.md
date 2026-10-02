---
"@raisins/react": patch
---

Remove `@storybook/cli` from runtime `dependencies` (it remains a devDependency). It was never imported at runtime and pulled ~270 packages, including vulnerable `tar`, into every consumer.
