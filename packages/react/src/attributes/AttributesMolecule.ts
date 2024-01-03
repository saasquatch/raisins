import { RaisinElementNode } from '@raisins/core';
import type { Attribute } from '@raisins/schema/schema';
import { Atom, atom } from 'jotai';
import { molecule } from 'bunshi/react';
import { ComponentModelMolecule } from '../component-metamodel';
import { SelectedNodeMolecule } from '../core';
import { NodeMolecule } from '../node/NodeMolecule';

/**
 * Properties and changes for ALL the attributes of a node.
 *
 * Scoped to the {@link NodeMolecule}
 */
export const AttributesMolecule = molecule((getMol) => {
  const { SelectedNodeAtom } = getMol(SelectedNodeMolecule);
  const { ComponentMetaAtom } = getMol(ComponentModelMolecule);
  const { attributesForNode, componentMetaForNode } = getMol(NodeMolecule);

  const schemaAtom = atom((get) => {
    const selectedNode = get(SelectedNodeAtom) as RaisinElementNode;
    const metamodel = get(ComponentMetaAtom);

    const attributes = selectedNode
      ? metamodel(selectedNode.tagName).attributes
      : get(componentMetaForNode)?.attributes;
    sortByGroup(attributes);
    return attributes;
  });

  const groupedSchemaAtom: Atom<AttributeGroups> = atom((get) => {
    const attributes = get(componentMetaForNode)?.attributes;
    const groupedList = attributes ? group(attributes) : {};
    return groupedList;
  });

  const keysAtom = atom(
    (get) =>
      // Use the set of attributes from the schema, default to the sey from the attributes
      get(schemaAtom)?.map((a) => a.name) ?? Object.keys(get(attributesForNode))
  );

  return {
    // TODO: attributesForNode is not the currently selectedNode
    valuesAtom: attributesForNode,
    schemaAtom,
    groupedSchemaAtom,
    keysAtom,
  };
});

function sortByGroup(attributes?: Attribute[]) {
  attributes?.sort((a, b) => {
    if (!a.uiGroup) return 1;
    return a.uiGroup > b.uiGroup! ? 1 : -1;
  });
}

// TODO: Config we want this name, it could conflict
const DEFAULT_GROUP = 'default';

type AttributeGroups = Record<string, Attribute[]>;
function group(list: Attribute[]): AttributeGroups {
  return list.reduce(function (
    allGroups: AttributeGroups,
    attribute: Attribute
  ) {
    const key = attribute.uiGroup ?? DEFAULT_GROUP;
    const groupArray = allGroups[key] ?? [];
    const withAttribute = [...groupArray, attribute];
    return {
      ...allGroups,
      [key]: withAttribute,
    };
  },
  {} as AttributeGroups);
}
