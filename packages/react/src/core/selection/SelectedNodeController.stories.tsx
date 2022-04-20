import { atom } from 'jotai';
import { molecule, useMolecule } from 'jotai-molecules';
import React from 'react';
import { RaisinConfig } from '..';
import { AttributesController } from '../../attributes';
import { CanvasController } from '../../canvas';
import { BasicCanvasController } from '../../canvas/CanvasController';
import { CanvasProvider } from '../../canvas/CanvasScope';
import { CanvasHoveredMolecule } from '../../canvas/plugins/CanvasHoveredMolecule';
import { CanvasPickAndPlopMolecule } from '../../canvas/plugins/CanvasPickAndPlopMolecule';
import { CanvasSelectionMolecule } from '../../canvas/plugins/CanvasSelectionMolecule';
import {
  mintMono,
  MintComponents,
  mintReferralTable,
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

const AttributeEditor = () => {
  useMolecule(CanvasSelectionMolecule);
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <SelectedNodeController
          HasSelectionComponent={AttributesController}
          NoSelectionComponent={() => <div>no selection</div>}
        ></SelectedNodeController>
      </div>
      <div style={{ width: '50%' }}>
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
