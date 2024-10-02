import { Attribute } from '@raisins/schema/schema';
import { createScope, molecule, ScopeProvider } from 'bunshi/react';
import { Atom, atom, PrimitiveAtom, SetStateAction } from 'jotai';
import React from 'react';
import { isFunction } from '../util/isFunction';
import { AttributeConfigMolecule } from './AttributeConfig';
import { AttributesMolecule } from './AttributesMolecule';
import { resolveComponent } from './resolveComponent';

const AttributeScope = createScope<string | undefined>(undefined);
AttributeScope.displayName = 'AttributeScope';

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
export const AttributeMolecule = molecule(getMol => {
  const attributesAtoms = getMol(AttributesMolecule);
  const name = getMol(AttributeScopeMolecule);
  const config = getMol(AttributeConfigMolecule);

  const valueAtom = atom(
    get => {
      return get(attributesAtoms.valuesAtom)[name];
    },
    (_, set, next: SetStateAction<string | undefined>) => {
      set(attributesAtoms.valuesAtom, (prev: { [key: string]: string }) => {
        // @ts-expect-error Not all constituents of type are callable
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
    get =>
      get(attributesAtoms.schemaAtom)?.find(s => s.name === name) ?? { name }
  );

  const clearAtom = atom(null, (_, set) => set(valueAtom, undefined));

  const WidgetAtom = atom(get =>
    resolveComponent(get(schemaAtom), get(config.AttributeTheme.widgets))
  );
  const FieldAtom = atom(get =>
    resolveComponent(get(schemaAtom), get(config.AttributeTheme.fields))
  );
  const TemplateAtom = atom(get =>
    resolveComponent(get(schemaAtom), get(config.AttributeTheme.templates))
  );

  const booleanValueAtom: PrimitiveAtom<boolean | undefined> = atom(
    get => toBoolean(get(valueAtom)),
    (_, set, next) => {
      set(valueAtom, prev => {
        // @ts-expect-error Not all constituents of type are callable
        const value = isFunction(next) ? next(toBoolean(prev)) : next;
        // Empty string for true, undefined for false
        return value ? '' : undefined;
      });
    }
  );

  const numberValueAtom: PrimitiveAtom<number | undefined> = atom(
    get => toNumber(get(valueAtom)),
    (_, set, next) => {
      set(valueAtom, prev => {
        // @ts-expect-error Not all constituents of type are callable
        const value = isFunction(next) ? next(toNumber(prev)) : next;
        // Empty string for true, undefined for false
        return value?.toString();
      });
    }
  );

  return {
    name,
    valueAtom,
    booleanValueAtom,
    numberValueAtom,
    schemaAtom,
    clearAtom,
    WidgetAtom,
    FieldAtom,
    TemplateAtom,
  };
});

function toBoolean(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  return typeof value !== 'undefined';
}
function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const number = Number(value);
  // This might cause weird bugs
  if (Number.isNaN(number)) return undefined;
  return number;
}

/**
 * Provides scope for a {@link AttributeScopeMolecule} and {@link AttributeMolecule}
 */
export const AttributeProvider: React.FC<{
  attributeName: string;
  children: React.PropsWithChildren['children'];
}> = props => (
  <ScopeProvider scope={AttributeScope} value={props.attributeName}>
    {props.children}
  </ScopeProvider>
);
