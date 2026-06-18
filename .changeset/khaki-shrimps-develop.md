---
"@raisins/react": minor
"@raisins/core": minor
---

Add parse error reporting for malformed CSS and harden rendering against invalid style serialization.

`@raisins/core` now exposes `parseWithErrors()` and parse error types so callers can inspect recoverable CSS parse issues found in `style` attributes and `<style>` tags.

`@raisins/react` now surfaces those parse errors in the node error stack and avoids crashing canvas rendering when style serialization fails.
