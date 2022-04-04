import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ComponenetModelMolecule } from '../component-metamodel/ComponentModel';
import { moduleDetailsToScriptSrc } from '../component-metamodel/convert/moduleDetailsToScriptSrc';
import { NPMRegistryAtom } from '../util/NPMRegistry';

export const CanvasScriptsMolecule = molecule((getMol) => {
  const { LocalURLAtom, ModuleDetailsAtom } = getMol(ComponenetModelMolecule);
  // HTML script tags for canvas
  const CanvasScriptsAtom = atom<string>((get) => {
    const localUrl = get(LocalURLAtom);
    const moduleDetails = get(ModuleDetailsAtom);
    const registry = get(NPMRegistryAtom);
    return moduleDetailsToScriptSrc(moduleDetails, localUrl, registry);
  });

  return {
    CanvasScriptsAtom,
  };
});
