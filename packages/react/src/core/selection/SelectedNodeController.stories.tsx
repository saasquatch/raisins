import { atom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'bunshi/react';
import React from 'react';
import type { RaisinConfig } from '../../core/index.ts';
import {
  AttributeMolecule,
  AttributeProvider,
  AttributesController,
  type AttributesControllerProps,
  AttributesMolecule,
} from '../../attributes/index.ts';
import { BasicCanvasController } from '../../canvas/CanvasController.tsx';
import { CanvasProvider } from '../../canvas/CanvasScope.tsx';
import { CanvasSelectionMolecule } from '../../canvas/plugins/CanvasSelectionMolecule.tsx';
import {
  mintMono,
  MintComponents,
  mintReferralTable,
  mintBigStat,
} from '../../examples/MintComponents.tsx';
import { widgets } from '../../examples/MockWidgets.tsx';
import {
  referrerWidget,
  VanillaComponents,
} from '../../examples/VanillaComponents.tsx';
import { BasicStory, StoryConfigMolecule } from '../../index.stories.tsx';
import { SelectedNodeController } from './SelectedNodeController.tsx';

export default {
  title: 'Selected Node Controller',
  excludeStories: [
    'AttributeEditorView',
    'CustomAttributesControllerView',
    'DefaultAttributeComponentView',
  ],
};

const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
  return {
    ...getMol(StoryConfigMolecule),
    AttributeTheme: {
      widgets: atom(widgets),
    },
  };
});

export const AttributeEditorView = ({
  Controller = () => (
    <SelectedNodeController
      HasSelectionComponent={AttributesController}
    ></SelectedNodeController>
  ),
}) => {
  useMolecule(CanvasSelectionMolecule);
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '13px' }}>
      <div
        style={{
          flex: '0 0 320px',
          overflowY: 'auto',
          padding: '12px',
          borderRight: '1px solid #e0e0e0',
        }}
      >
        <Controller />
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
        }}
      >
        <BasicCanvasController />
      </div>
    </div>
  );
};

const CanvasEditor = () => (
  <CanvasProvider>
    <AttributeEditorView />
  </CanvasProvider>
);

const AttributeControllerStory = ({
  HasSelectionComponent,
}: {
  HasSelectionComponent: React.ComponentType;
}) => (
  <BasicStory
    startingHtml={mintMono}
    startingPackages={MintComponents}
    Molecule={ConfigMolecule}
  >
    <CanvasProvider>
      <AttributeEditorView
        Controller={() => (
          <SelectedNodeController
            HasSelectionComponent={HasSelectionComponent}
          />
        )}
      />
    </CanvasProvider>
  </BasicStory>
);

export const AttributeEditor = () => (
  <AttributeControllerStory HasSelectionComponent={AttributesController} />
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
        <AttributeEditorView
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
        <AttributeEditorView
          Controller={() => (
            <SelectedNodeController
              HasSelectionComponent={CustomAttributesControllerView}
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
        <AttributeEditorView
          Controller={() => (
            <SelectedNodeController
              HasSelectionComponent={CustomAttributesControllerView}
            ></SelectedNodeController>
          )}
        />
      </CanvasProvider>
    </BasicStory>
  );
};

export const CustomAttributesControllerView: React.FC<AttributesControllerProps> = props => {
  const { keysAtom, groupedSchemaAtom } = useMolecule(AttributesMolecule);
  const keys = useAtomValue(keysAtom);
  const groupedSchema = useAtomValue(groupedSchemaAtom);

  if (!keys) return <></>;
  const Component = props.Component ?? DefaultAttributeComponentView;
  return (
    <>
      {Object.keys(groupedSchema).map((key, idx) => {
        return (
          <details key={idx}>
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

export const CustomAttributesController = () => (
  <AttributeControllerStory
    HasSelectionComponent={CustomAttributesControllerView}
  />
);

export const DefaultAttributeComponentView = () => {
  const { FieldAtom } = useMolecule(AttributeMolecule);
  const Field = useAtomValue(FieldAtom);
  return <Field />;
};

export const DefaultAttributeComponent = () => (
  <AttributeControllerStory
    HasSelectionComponent={() => (
      <AttributesController Component={DefaultAttributeComponentView} />
    )}
  />
);
