import * as schema from '@raisins/schema/schema';
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
