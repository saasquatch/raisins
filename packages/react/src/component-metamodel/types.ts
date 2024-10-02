import * as schema from '@raisins/schema/schema';
import type { PackageJson } from '../util/NPMRegistry';

export type Module = {
  package: string;
  version?: string;
  filePath?: string;
};

export type ModuleDetails = {
  'package.json': PackageJson;
  raisins?: schema.Package;
  status?: string;
} & Module;

export type ResolveType<T> = T extends Promise<infer V> ? V : T;
export type Loadable<Value> =
  | {
      state: 'loading';
    }
  | {
      state: 'hasError';
      error: unknown;
    }
  | {
      state: 'hasData';
      data: ResolveType<Value>;
    };
