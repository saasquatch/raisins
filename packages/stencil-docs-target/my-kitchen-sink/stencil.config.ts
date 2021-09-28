import { Config } from '@stencil/core';
import plugin from "../";

export const config: Config = {
  namespace: 'my-kitchen-sink',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
    },
    plugin({
      outDir:"docs"
    })
  ],
};
