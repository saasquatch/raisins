import { molecule } from "bunshi/react";
import { atom } from "jotai";
import { ComponentModelMolecule } from "../component-metamodel/ComponentModel.tsx";
import { moduleDetailsToScriptSrc } from "../component-metamodel/convert/moduleDetailsToScriptSrc.tsx";
import { NPMRegistryAtom } from "../util/NPMRegistry.ts";

export const CanvasScriptsMolecule = molecule((getMol) => {
  const { LocalURLAtom, ModuleDetailsAtom } = getMol(ComponentModelMolecule);
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
