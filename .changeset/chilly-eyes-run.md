---
"@raisins/stencil-docs-target": minor
"@raisins/schema": minor
"@raisins/react": minor
"@raisins/core": minor
---

@raisins/schema: Add CustomElement.cssParts field and the CssPart type so components can declare the ::part(name) surfaces they expose for styling.

@raisins/stencil-docs-target: Emit cssParts and cssProperties from Stencil's @csspart / @cssprop JSDoc tags when converting component docs.

@raisins/core: Add scopeStylesheet(), which rewrites :host, :host(<sel>), ::part(name), bare selectors a stylesheet applies only to a scoped element. Also add an optional cloneNode argument to htmlUtil.duplicate() so callers can customize cloned nodes (e.g., assign new ids).

@raisins/react: Add CssEditingMolecule, StyleMolecule + StylePanel (per-:host and per-::part section editors), and DocumentCssMolecule + DocumentCssEditor for page-wide CSS.
