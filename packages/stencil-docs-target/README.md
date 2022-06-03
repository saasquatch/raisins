## Raisins Stencil Docs Target

A [custom docs target](https://stenciljs.com/docs/docs-custom) for Stencil that generates a file compatible with `@raisins/schema` library description format.

```js
import { Config } from '@stencil/core';
import plugin from '@raisins/stencil-docs-target';

export const config: Config = {
  outputTargets: [plugin({})],
};
```
