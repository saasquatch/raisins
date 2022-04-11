import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { NodeMolecule } from '../node/NodeMolecule';

/**
 * Properties and changes for ALL the attributes of a node.
 * 
 * Scoped to the {@link NodeMolecule}
 */
export const AttributesMolecule = molecule((getMol) => {
  const { attributesForNode, componentMetaForNode } = getMol(NodeMolecule);
  const schemaAtom = atom((get) => get(componentMetaForNode)?.attributes);

  const keysAtom = atom(
    (get) =>
      // Use the set of attributes from the schema, default to the sey from the attributes
      get(schemaAtom)?.map((a) => a.name) ?? Object.keys(get(attributesForNode))
  );

  return {
    valuesAtom: attributesForNode,
    schemaAtom,
    keysAtom,
  };
});
