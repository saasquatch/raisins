import { atom } from 'jotai';
import {
  LocalURLAtom,
  ModuleDetailsAtom,
} from '../component-metamodel/ComponentModel';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import { NPMRegistryAtom } from '../util/NPMRegistry';

// HTML script tags for canvas

export const CanvasScriptsAtom = atom<string>((get) => {
  const localUrl = get(LocalURLAtom);
  const moduleDetails = get(ModuleDetailsAtom);
  const registry = get(NPMRegistryAtom);
  return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
});
