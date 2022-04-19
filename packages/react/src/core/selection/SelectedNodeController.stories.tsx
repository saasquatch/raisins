import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import React from 'react';
import { RaisinConfig } from '..';
import { AttributesController } from '../../attributes';
import { CanvasController } from '../../canvas';
import { mintMono, MintComponents } from '../../examples/MintComponents';
import { widgets } from '../../examples/MockWidgets';
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

export const Controller = () => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <div style={{ display: 'flex' }}>
        <div>
          <SelectedNodeController
            HasSelectionComponent={AttributesController}
            NoSelectionComponent={() => <div>no selection</div>}
          ></SelectedNodeController>
        </div>
        <div style={{ width: '50%' }}>
          <CanvasController />
        </div>
      </div>
    </BasicStory>
  );
};
