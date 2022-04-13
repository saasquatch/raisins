import { Attribute } from '@raisins/schema/schema';
import { Atom, atom, SetStateAction } from 'jotai';
import { createScope, molecule, ScopeProvider } from 'jotai-molecules';
import React from 'react';
import { isFunction } from '../util/isFunction';
import { AttributesMolecule } from './AttributesMolecule';

const AttributeScope = createScope<string | undefined>(undefined);

/**
 * Scope for the attribute name (i.e. key) that is in scope
 */
export const AttributeScopeMolecule = molecule((_, getScope) => {
  const name = getScope(AttributeScope);
  if (!name)
    throw new Error('AttributeMolecule must be used in a <AttributeProvider>');
  return name;
});

/**
 * Atoms for a single attribute for a node
 *
 */
export const AttributeMolecule = molecule((getMol) => {
  const attributesAtoms = getMol(AttributesMolecule);
  const name = getMol(AttributeScopeMolecule);

  const valueAtom = atom(
    (get) => {
      return get(attributesAtoms.valuesAtom)[name];
    },
    (_, set, next: SetStateAction<string | undefined>) => {
      set(attributesAtoms.valuesAtom, (prev) => {
        const value = isFunction(next) ? next(prev[name]) : next;
        const attrbsClone = { ...prev };
        if (value === undefined) {
          delete attrbsClone[name];
        } else {
          attrbsClone[name] = value;
        }
        return attrbsClone;
      });
    }
  );
  const schemaAtom: Atom<Attribute> = atom(
    (get) =>
      get(attributesAtoms.schemaAtom)?.find((s) => s.name === name) ?? { name }
  );

  const clearAtom = atom(null, (_, set) => set(valueAtom, undefined));

  return {
    name,
    valueAtom,
    schemaAtom,
    clearAtom,
  };
});

/**
 * Provides scope for a {@link AttributeScopeMolecule} and {@link AttributeMolecule}
 */
export const AttributeProvider: React.FC<{ attributeName: string }> = (
  props
) => (
  <ScopeProvider scope={AttributeScope} value={props.attributeName}>
    {props.children}
  </ScopeProvider>
);