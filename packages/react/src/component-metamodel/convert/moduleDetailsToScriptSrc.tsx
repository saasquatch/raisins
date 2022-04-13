import { ModuleDetails } from '../types';
import { makeLocalRegistry, NPMRegistry } from '../../util/NPMRegistry';
import { LOCAL_REPO } from './LOCAL_REPO';

/**
 * Converts a set of ModuleDetails into appropriate `<script>` and `<link>` tags
 *
 * TODO: This algorithm needs to match the backend for how modules are rendered in SaaSquatch core
 *
 * @returns HTML for embedding those tags
 */
export function moduleDetailsToScriptSrc(
  moduleDetails: ModuleDetails[],
  localUrl: string | undefined,
  registry: NPMRegistry
) {
  const scripts =
    moduleDetails?.map((m) => {
      const { module, browser, main, unpkg } = m['package.json'];
      // Use the prescribed file path, if not then module, browser, or main or empty
      const filePath = m.filePath ?? unpkg ?? module ?? browser ?? main ?? '';
      const useModule = filePath === module || filePath.endsWith('.esm.js');
      const isCss = m.filePath && m.filePath.endsWith('.css');
      // TODO: Centralize registry better
      let registryToUse = registry;
      if (m.name === LOCAL_REPO && localUrl) {
        registryToUse = makeLocalRegistry(localUrl);
      }
      if (isCss)
        return ` <link rel="stylesheet" href="${registryToUse.resolvePath(
          m,
          m.filePath!
        )}" />`;
      return `<script src="${registryToUse.resolvePath(m, filePath)}" ${
        useModule && `type="module"`
      }></script>`;
    }) ?? [];

  const scriptSrc = scripts.join('\n');
  return scriptSrc;
}
