import * as schema from '@raisins/schema/schema';
import { makeLocalRegistry, unpkgNpmRegistry } from '../../util/NPMRegistry';

import { Module, ModuleDetails } from '../types';
import { LOCAL_REPO } from './LOCAL_REPO';

/**
 * Downloads module details from an NPM registry
 *
 * Defaults to using `fetch` for making the async calls
 */
export async function modulesToDetails(
  next: Module[],
  localUrl: string | undefined = undefined
): Promise<ModuleDetails[]> {
  const details: ModuleDetails[] = [];
  for (const module of next) {
    let registry = unpkgNpmRegistry;
    if (module.name === LOCAL_REPO && localUrl) {
      registry = makeLocalRegistry(localUrl);
    }
    const detail = await registry.getPackageJson(module);
    let raisinPkg: schema.Package | undefined = undefined;
    if (detail.raisins) {
      const resp = await fetch(registry.resolvePath(module, detail.raisins));
      raisinPkg = await resp.json();
    }
    details.push({
      ...module,
      'package.json': detail,
      raisins: raisinPkg,
    });
  }
  return details;
}
