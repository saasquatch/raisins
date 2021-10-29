import { atom } from "jotai";

export type Module = {
  name: string;
  version?: string;
};

export type PackageJson = {
  name: string;
  version: string;
  description?: string;
  /**
   * Path to the raisins description file
   *
   * No leading slashes
   *
   * e.g. "dist/raisins.json"
   */
  raisins?: string;
  author?: string;
  license?: string;
  /**
   * The ES Module path. (de-factor standard)
   *
   * https://stackoverflow.com/questions/42708484/what-is-the-module-package-json-field-for
   */
  module?: string;
  /**
   * If your module is meant to be used client-side the browser field should be used instead of the main field. This is helpful to hint users that it might rely on primitives that aren't available in Node.js modules. (e.g. window)
   *
   * https://docs.npmjs.com/cli/v7/configuring-npm/package-json#browser
   */
  browser?: string;
  /**
   * The main field is a module ID that is the primary entry point to your program. That is, if your package is named foo, and a user installs it, and then does require("foo"), then your main module's exports object will be returned.
   *
   * This should be a module relative to the root of your package folder.
   *
   * For most modules, it makes the most sense to have a main script and often not much else.
   *
   * If main is not set it defaults to index.js in the packages root folder.
   *
   * https://docs.npmjs.com/cli/v7/configuring-npm/package-json#main
   */
  main?: string;
  /**
   * For serving directly to the web from the CDN.
   * 
   * Stencil projects ship with this properly configured in their boilerplate
   */
  unpkg?: string;
};
export interface NPMRegistry {
  getPackageJson(module: Module): Promise<PackageJson>;
  resolvePath(module: Module, path: string): string;
}



const UNPKG_BASE = 'https://unpkg.com';

export const unpkgNpmRegistry: NPMRegistry = {
  async getPackageJson(m) {
    const path = this.resolvePath(m, 'package.json');

    const resp = await fetch(path);
    const json = await resp.json();
    return json;
  },
  resolvePath(module, path) {
    const version = module.version ?? 'latest';
    const resolved = `${UNPKG_BASE}/${module.name}@${version}/${path}`;
    return resolved;
  },
};

export function makeLocalRegistry(url: string): NPMRegistry {
  return {
    async getPackageJson(m) {
      const path = this.resolvePath(m, 'package.json');

      const resp = await fetch(path);
      const json = await resp.json();
      return json;
    },
    resolvePath(module, path) {
      const version = module.version ?? 'latest';
      const resolved = `${url}/${path}`;
      return resolved;
    },
  };
}

export const NPMRegistryAtom = atom(unpkgNpmRegistry);