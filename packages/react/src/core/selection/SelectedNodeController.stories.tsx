import { molecule, useMolecule } from 'bunshi/react';
import { atom, useAtomValue } from 'jotai';
import React from 'react';
import { RaisinConfig } from '..';
import {
  AttributeMolecule,
  AttributeProvider,
  AttributesController,
  AttributesControllerProps,
  AttributesMolecule,
} from '../../attributes';
import { BasicCanvasController } from '../../canvas/CanvasController';
import { CanvasProvider } from '../../canvas/CanvasScope';
import { CanvasSelectionMolecule } from '../../canvas/plugins/CanvasSelectionMolecule';
import {
  MintComponents,
  mintBigStat,
  mintMono,
  mintReferralTable,
} from '../../examples/MintComponents';
import { widgets } from '../../examples/MockWidgets';
import {
  VanillaComponents,
  referrerWidget,
} from '../../examples/VanillaComponents';
import { BasicStory, StoryConfigMolecule } from '../../index.stories';
import { SelectedNodeController } from './SelectedNodeController';

export default {
  title: 'Selected Node Controller',
  excludeStories: ['AttributeEditor', 'DefaultAttributeComponent'],
};

const ConfigMolecule = molecule<Partial<RaisinConfig>>(getMol => {
  return {
    ...getMol(StoryConfigMolecule),
    AttributeTheme: {
      widgets: atom(widgets),
    },
  };
});

export const AttributeEditor = ({
  Controller = () => (
    <SelectedNodeController
      HasSelectionComponent={AttributesController}
    ></SelectedNodeController>
  ),
}) => {
  useMolecule(CanvasSelectionMolecule);
  return (
    <div style={{ display: 'flex' }}>
      <div
        style={{
          width: '40%',
          position: 'fixed',
          overflowY: 'scroll',
          height: '95vh',
        }}
      >
        <Controller />
      </div>
      <div
        style={{
          width: '59%',
          position: 'absolute',
          right: 0,
        }}
      >
        <BasicCanvasController />
      </div>
    </div>
  );
};

const CanvasEditor = () => (
  <CanvasProvider>
    <AttributeEditor />
  </CanvasProvider>
);
export const Mint = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <CanvasEditor />
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
      <CanvasEditor />
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
      <CanvasEditor />
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
      <CanvasEditor />
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
      <CanvasProvider>
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
      </CanvasProvider>
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
      <CanvasProvider>
        <AttributeEditor
          Controller={() => (
            <SelectedNodeController
              HasSelectionComponent={CustomAttributesController}
            ></SelectedNodeController>
          )}
        />
      </CanvasProvider>
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
      <CanvasProvider>
        <AttributeEditor
          Controller={() => (
            <SelectedNodeController
              HasSelectionComponent={CustomAttributesController}
            ></SelectedNodeController>
          )}
        />
      </CanvasProvider>
    </BasicStory>
  );
};

const CustomAttributesController: React.FC<AttributesControllerProps> = props => {
  const { keysAtom, groupedSchemaAtom } = useMolecule(AttributesMolecule);
  const keys = useAtomValue(keysAtom);
  const groupedSchema = useAtomValue(groupedSchemaAtom);

  if (!keys) return <></>;
  const Component = props.Component ?? DefaultAttributeComponent;
  return (
    <>
      {Object.keys(groupedSchema).map((key, idx) => {
        return (
          <details key={idx}>
            <summary>{key}</summary>
            {groupedSchema[key].map(attribute => {
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

export const DefaultAttributeComponent = () => {
  const { FieldAtom } = useMolecule(AttributeMolecule);
  const Field = useAtomValue(FieldAtom);
  return <Field />;
};
