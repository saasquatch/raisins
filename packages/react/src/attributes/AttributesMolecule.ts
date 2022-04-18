import { Attribute } from '@raisins/schema';
import { atom, useAtomValue } from 'jotai';
import { molecule } from 'jotai-molecules';
import { NodeMolecule } from '../node/NodeMolecule';

/**
 * Properties and changes for ALL the attributes of a node.
 *
 * Scoped to the {@link NodeMolecule}
 */
export const AttributesMolecule = molecule((getMol) => {
  const { attributesForNode, componentMetaForNode } = getMol(NodeMolecule);
  const schemaAtom = atom((get) => {
    const attributes = get(componentMetaForNode)?.attributes;
    sortByGroup(attributes);
    console.log({ sortedList: attributes });
    return attributes;
  });

  const groupedSchemaAtom = atom((get) => {
    const attributes = get(componentMetaForNode)?.attributes;
    const groupedList = attributes ? group(attributes, 'uiGroup') : undefined;
    console.log({ groupedList });
    return attributes;
  });

  const keysAtom = atom(
    (get) =>
      // Use the set of attributes from the schema, default to the sey from the attributes
      get(schemaAtom)?.map((a) => a.name) ?? Object.keys(get(attributesForNode))
  );

  return {
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

function group(list: Attribute[], key: string) {
  return list?.reduce(function (allGroups: Attribute[], attribute: Attribute) {
    var group = attribute[key];
    (allGroups[group] = allGroups[group] || []).push(attribute);
    return allGroups;
  }, {});
}
