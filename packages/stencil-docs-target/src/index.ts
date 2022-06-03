import * as schema from '@raisins/schema/schema';
import { JsonDocs, OutputTargetDocsCustom } from '@stencil/core/internal';
import { convertToGrapesJSMeta } from './convertToRaisins';
import { writeFile } from './writeFile';

export type Config = {
  /**
   * The output directory for the plugin (i.e. docs)
   */
  outDir: string;

  /**
   * The output file name
   */
  outFile: string;

  /**
   * A static list of GrapesJS components to export
   */
  extraModules: schema.Module[];

  /**
   * A post-processor to modify the generated packages
   */
  postProcess: (pgks: schema.Module[], docs: JsonDocs) => schema.Module[];
};

/**
 * Creates an output target to use in your `stencil.config.ts` file.
 *
 * @param config
 */
export function raisinsDocsTarget({
  outDir = process.env.PWD ?? process.cwd(),
  outFile = 'raisins.json',
  extraModules: extraPackages = [],
  postProcess = m => m,
}: Partial<Config> = {}): OutputTargetDocsCustom {
  async function generator(docsJson: JsonDocs) {
    try {
      // Extracted from JSON / JSDocs Tags
      const stencilComponents = convertToGrapesJSMeta(docsJson);

      // Includes hard-coded content
      const allComponents: schema.Module[] = [
        stencilComponents,
        ...extraPackages,
      ];

      // Post-processing (someone will want this)
      const postProcessed = postProcess(allComponents, docsJson);
      const pkg: schema.Package = {
        schemaVersion: '0.0.1',
        modules: postProcessed,
      };

      const stringifiedFile = JSON.stringify(pkg);
      await writeFile(outDir, outFile, stringifiedFile);
    } catch (e) {
      console.error('Error in raisins docs target for stencil', e);
      throw e;
    }
  }

  return {
    type: 'docs-custom',
    generator,
  };
}
export default raisinsDocsTarget;
