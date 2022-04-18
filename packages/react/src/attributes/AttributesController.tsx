import { useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { AttributeProvider } from './AttributeMolecule';
import { AttributesMolecule } from './AttributesMolecule';

export type AttributesControllerProps = {
  /**
   * A component to render for every attribute.
   *
   * Values provided contextually via {@link AttributeMolecule}
   */
  Component: React.ComponentType;
};

/**
 * Renders a Component in {@link AttributeProvider} for every attribute
 *
 * @param props
 * @returns
 */
export const AttributesController: React.FC<AttributesControllerProps> = (
  props
) => {
  const { keysAtom, schemaAtom, groupedSchemaAtom } = useMolecule(
    AttributesMolecule
  );
  const keys = useAtomValue(keysAtom);
  const schema = useAtomValue(schemaAtom);
  const groupedSchema = useAtomValue(groupedSchemaAtom);

  if (!keys) return <></>;
  return (
    <React.Fragment>
      {keys.map((key) => {
        return (
          <AttributeProvider attributeName={key} key={key}>
            <props.Component />
          </AttributeProvider>
        );
      })}
    </React.Fragment>
  );
};
