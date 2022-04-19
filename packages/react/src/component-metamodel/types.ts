import * as schema from '@raisins/schema/schema';
import { WritableAtom } from 'jotai';
import { Atom, SetAtom } from 'jotai/core/atom';
import type { PackageJson } from '../util/NPMRegistry';

export type Module = {
  name: string;
  version?: string;
  filePath?: string;
};

export type ModuleDetails = {
  'package.json': PackageJson;
  raisins?: schema.Package;
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
