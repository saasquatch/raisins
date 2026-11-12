import { validateNode } from "@raisins/core";
import { molecule } from "bunshi/react";
import { atom } from "jotai";
import { ComponentModelMolecule } from "../component-metamodel/index.ts";
import { CoreMolecule } from "../core/index.ts";

export const ValidationMolecule = molecule((getMol) => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const MetaMolecule = getMol(ComponentModelMolecule);

  const errorsAtom = atom((get) => {
    const root = get(RootNodeAtom);
    const meta = get(MetaMolecule.ComponentsAtom);
    const errorStack = validateNode(root, meta);
    return errorStack;
  });

  return {
    errorsAtom,
  };
});
