export type Module = {
  name: string;
  version?: string;
};

export type PackageJson = {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
};
export interface NPMRegistry {
  getPackageJson(module: Module): Promise<PackageJson>;
}

export const unpkgNpmRegistry: NPMRegistry = {
  async getPackageJson(m) {
    const version = m.version ?? 'latest';
    const path = `https://unpkg.com/${m.name}@${version}/package.json`;

    const resp = await fetch(path);
    const json = await resp.json();
    return json;
  },
};

export default unpkgNpmRegistry;