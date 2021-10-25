import * as schema from '@raisins/schema/schema';
import { PackageJson } from '../util/NPMRegistry';

export type ModuleManagement = {
  loadingModules: boolean;
  modules: Module[];
  moduleDetails: ModuleDetails[];
  addModule(module: Module): void;
  removeModule(module: Module): void;
  removeModuleByName(name: string): void;
  setModules(moduleS: Module[]): void;
};

export type Module = {
  name: string;
  version?: string;
  filePath?: string;
};

export type ModuleDetails = {
  'package.json': PackageJson;
  raisins?: schema.Package;
} & Module;
