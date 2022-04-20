import { atom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import React from 'react';
import { RaisinConfig } from '..';
import {
  AttributeMolecule,
  AttributeProvider,
  AttributesController,
  AttributesControllerProps,
  AttributesMolecule,
} from '../../attributes';
import { CanvasController } from '../../canvas';
import {
  mintMono,
  MintComponents,
  mintReferralTable,
  mintBigStat,
} from '../../examples/MintComponents';
import { widgets } from '../../examples/MockWidgets';
import {
  referrerWidget,
  VanillaComponents,
} from '../../examples/VanillaComponents';
import { BasicStory, StoryConfigMolecule } from '../../index.stories';
import { SelectedNodeController } from './SelectedNodeController';

export default {
  title: 'Selected Node Controller',
};

const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
  return {
    ...getMol(StoryConfigMolecule),
    AttributeTheme: {
      widgets: atom(widgets),
    },
  };
});

const AttributeEditor = ({
  Controller = () => (
    <SelectedNodeController
      HasSelectionComponent={AttributesController}
    ></SelectedNodeController>
  ),
}) => (
  <div style={{ display: 'flex' }}>
    <div
      style={{
        width: '50%',
        position: 'fixed',
        overflowY: 'scroll',
        height: '95vh',
      }}
    >
      <Controller />
    </div>
    <div
      style={{
        width: '50%',
        position: 'absolute',
        right: 0,
      }}
    >
      <CanvasController />
    </div>
  </div>
);

export const Mint = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor />
    </BasicStory>
  );
};

export const MintReferralTable = () => {
  return (
    <BasicStory
      startingHtml={mintReferralTable}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor />
    </BasicStory>
  );
};

export const MintBigStat = () => {
  return (
    <BasicStory
      startingHtml={mintBigStat}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor />
    </BasicStory>
  );
};

export const Vanilla = () => {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor />
    </BasicStory>
  );
};

export const CustomUnselectedComponent = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor
        Controller={() => (
          <SelectedNodeController
            HasSelectionComponent={AttributesController}
            NoSelectionComponent={() => (
              <div>
                <h3>No component currently selected.</h3>
                <p>Select a component to begin customizing!</p>
              </div>
            )}
          ></SelectedNodeController>
        )}
      />
    </BasicStory>
  );
};

export const CustomSelectedComponentMint = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor
        Controller={() => (
          <SelectedNodeController
            HasSelectionComponent={CustomAttributesController}
          ></SelectedNodeController>
        )}
      />
    </BasicStory>
  );
};

export const CustomSelectedComponentVanilla = () => {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
      Molecule={ConfigMolecule}
    >
      <AttributeEditor
        Controller={() => (
          <SelectedNodeController
            HasSelectionComponent={CustomAttributesController}
          ></SelectedNodeController>
        )}
      />
    </BasicStory>
  );
};

const CustomAttributesController: React.FC<AttributesControllerProps> = (
  props
) => {
  const { keysAtom, groupedSchemaAtom } = useMolecule(AttributesMolecule);
  const keys = useAtomValue(keysAtom);
  const groupedSchema = useAtomValue(groupedSchemaAtom);

  if (!keys) return <></>;
  const Component = props.Component ?? DefaultAttributeComponent;
  return (
    <>
      {Object.keys(groupedSchema).map((key) => {
        return (
          <details>
            <summary>{key}</summary>
            {groupedSchema[key].map((attribute) => {
              return (
                <AttributeProvider
                  attributeName={attribute.name}
                  key={attribute.name}
                >
                  <Component />
                </AttributeProvider>
              );
            })}
            <hr />
          </details>
        );
      })}
    </>
  );
};

const DefaultAttributeComponent = () => {
  const { FieldAtom } = useMolecule(AttributeMolecule);
  const Field = useAtomValue(FieldAtom);
  return <Field />;
};
