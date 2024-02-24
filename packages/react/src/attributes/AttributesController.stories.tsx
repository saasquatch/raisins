import { atom, useAtomValue } from 'jotai';
import { molecule, useMolecule } from 'bunshi/react';
import React from 'react';
import { CanvasController } from '../canvas';
import { RaisinConfig } from '../core/RaisinConfigScope';
import {
  big,
  mintBigStat,
  MintComponents,
  mintHeroImage,
  mintMono,
  mintTaskCard,
} from '../examples/MintComponents';
import { widgets } from '../examples/MockWidgets';
import {
  referralList,
  referrerWidget,
  VanillaComponents,
} from '../examples/VanillaComponents';
import {
  BasicStory,
  ErrorListController,
  StoryConfigMolecule,
} from '../index.stories';
import { NodeChildrenEditor } from '../node/NodeChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { AttributeMolecule } from './AttributeMolecule';
import { AttributesController } from './AttributesController';
import { AttributeTemplateProps } from './AttributeThemeMolecule';
import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';


const meta = {
  title: 'Attributes Controller',
  argTypes: {
    canvas: {
      control: 'boolean',
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
  return {
    ...getMol(StoryConfigMolecule),
    AttributeTheme: {
        templates: atom({ default: CustomTemplate }),
        widgets: atom(widgets),
    },
  };
});

const CustomTemplate = (
  props: React.PropsWithChildren<AttributeTemplateProps>
) => {
  const { name, schemaAtom } = useMolecule(AttributeMolecule);
  const schema = useAtomValue(schemaAtom);

  return (
    <div data-testid={name}>
      <p>
        <b>{schema.title ?? name}</b>
      </p>
      <div>{props.children}</div>
    </div>
  );
};

const CustomField = () => {
  const { WidgetAtom, TemplateAtom, schemaAtom } = useMolecule(
    AttributeMolecule
  );
  const Widget = useAtomValue(WidgetAtom);
  const Template = useAtomValue(TemplateAtom);
  const schema = useAtomValue(schemaAtom);

  return (
    <Template>
      <p style={{ margin: '0' }}>
        <b>Your widget: {schema.uiWidget || 'default'}</b>
        {' - '}
        <b>Group: {schema.uiGroup || 'default'}</b>
      </p>
      <Widget />
      <br />
    </Template>
  );
};

const AttributesEditorBaseStory = ({ canvas }: { canvas: boolean }) => {
  const Canvas = () =>
    canvas ? (
      <div style={{ flex: 1 }}>
        <CanvasController />
      </div>
    ) : (
      <></>
    );

  return (
    <div style={{ display: 'flex' }}>
      <NodeChildrenEditor Component={AttributesAndChildren} />
      <Canvas />
    </div>
  );
};

const AttributesAndChildren = () => {
  return (
    <div>
      <AttributesEditor />
      <div style={{ borderLeft: '10px solid grey' }}>
        <NodeChildrenEditor Component={AttributesAndChildren} />
      </div>
    </div>
  );
};

export const MyKitchenSink:Story = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={`<my-ui-component first="Stencil" last="'Don't call me a framework' JS" picked-date="1649799530937" text-color="#F00"></my-ui-component>`}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
MyKitchenSink.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);

  const fields = ["first","last","picked-date","text-color"];

  for(const field of fields){

    const fieldDiv = canvas.getByTestId(field);

    const inputElement = fieldDiv.querySelector("input")!;

    await userEvent.type(inputElement, field.toUpperCase());

    await sleep(500);
  }
}

export const Mint = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintErrors = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={`<b><div>Ancestor error here</div></b> ${mintMono}`}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <>
        <ErrorListController />
        <AttributesEditorBaseStory canvas={canvas} />
      </>
    </BasicStory>
  );
};

export const MintBigStat = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={mintBigStat}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintHeroImage = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={mintHeroImage}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintTaskCard = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={mintTaskCard}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintTaskCardTemplate = ({ canvas }: { canvas: boolean }) => {
  const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
    return {
      ...getMol(StoryConfigMolecule),
      AttributeTheme: {
        templates: atom({ default: CustomTemplate }),
      },
    };
  });
  return (
    <BasicStory
      startingHtml={mintTaskCard}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintTaskCardField = ({ canvas }: { canvas: boolean }) => {
  const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
    return {
      ...getMol(StoryConfigMolecule),
      AttributeTheme: {
        fields: atom({ default: CustomField }),
      },
    };
  });
  return (
    <BasicStory
      startingHtml={mintTaskCard}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const Vanilla = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};
export const VanillaReferralList = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={referralList}
      startingPackages={VanillaComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

export const Big = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={big}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <AttributesEditorBaseStory canvas={canvas} />
    </BasicStory>
  );
};

function AttributesEditor() {
  return (
    <div data-attributes-editor style={{ flex: '1' }}>
      <TagName />
      <AttributesController />
      <Debugging />
      <Errors />
    </div>
  );
}
const Errors = () => {
  const atoms = useMolecule(NodeMolecule);
  const errors = useAtomValue(atoms.errorsAtom);
  return (
    <div>
      Errors:
      <ul>
        {errors.map((e) => (
          <li>{e.error.rule}</li>
        ))}
      </ul>
    </div>
  );
};

const TagName = () => {
  const atoms = useMolecule(NodeMolecule);
  const tagName = useAtomValue(atoms.tagNameAtom);
  return <div>Attributes for {tagName}</div>;
};

const Debugging = () => {
  const { attributesForNode } = useMolecule(NodeMolecule);
  const attributes = useAtomValue(attributesForNode);

  return (
    <details>
      <summary>Debugging</summary>
      Attributes: <br />
      <pre style={{ overflow: 'scroll' }}>
        {JSON.stringify(attributes, null, 2)}
      </pre>
      Schema:
    </details>
  );
};
