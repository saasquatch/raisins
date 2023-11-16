import { useMolecule } from 'bunshi/react';
import { useAtomValue } from 'jotai';
import React from 'react';
import { AttributeMolecule, AttributeProvider } from './AttributeMolecule';
import { AttributesMolecule } from './AttributesMolecule';

export type AttributesControllerProps = {
  /**
   * A component to render for every attribute.
   *
   * Values provided contextually via {@link AttributeMolecule}
   *
   * Will default to a Field component from {@link AttributeMolecule}
   */
  Component?: React.ComponentType;
};

/**
 * Renders a Component in {@link AttributeProvider} for every attribute
 * in scope for the {@link AttributesMolecule}
 */
export const AttributesController: React.FC<AttributesControllerProps> = props => {
  const { keysAtom } = useMolecule(AttributesMolecule);
  const keys = useAtomValue(keysAtom);

  if (!keys) return <></>;
  const Component = props.Component ?? DefaultAttributeComponent;
  return (
    <React.Fragment>
      {keys.map((key: string) => {
        return (
          <AttributeProvider attributeName={key} key={key}>
            <Component />
          </AttributeProvider>
        );
      })}
    </React.Fragment>
  );
};

const DefaultAttributeComponent = () => {
  const { FieldAtom } = useMolecule(AttributeMolecule);
  const Field = useAtomValue(FieldAtom);
  return <Field />;
};
