import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule, molecule } from 'jotai-molecules';
import React, { Fragment } from 'react';
import { NodeChildrenEditor } from '../node/NodeChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { BasicStory, StoryConfigMolecule } from '../index.stories';
import {
  big,
  mintBigStat,
  MintComponents,
  mintHeroImage,
  mintMono,
  mintTaskCard,
} from '../examples/MintComponents';
import { AttributeMolecule } from './AttributeMolecule';
import { AttributesController } from './AttributesController';
import { CanvasController } from '../canvas';
import {
  referralList,
  referrerWidget,
  VanillaComponents,
} from '../examples/VanillaComponents';
import { Clear, Widgets, widgets } from '../examples/MockWidgets';
import { RaisinConfig } from '../core/RaisinPropsScope';
import { AttributeTemplateProps } from './AttributeThemeMolecule';

export default {
  title: 'Attributes Controller',
  argTypes: {
    canvas: {
      control: 'boolean',
    },
  },
};

const ConfigMolecule = molecule<Partial<RaisinConfig>>((getMol) => {
  return {
    ...getMol(StoryConfigMolecule),
    AttributeTheme: {
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
    <div>
      <p>
        <b>{schema.title ?? name}</b>
      </p>
      <div>{props.children}</div>
      <p style={{ color: 'red' }}>Description override</p>
    </div>
  );
};

const CustomField = () => {
  const { WidgetAtom, TemplateAtom, schemaAtom } = useMolecule(
    AttributeMolecule
  );
  const Widget = useAtomValue(WidgetAtom);
  const Template = useAtomValue(TemplateAtom);

  const widgetUsed = useAtomValue(schemaAtom).uiWidget;
  return (
    <Template>
      <p>
        <b>Your widget: {widgetUsed || 'default'}</b>
      </p>
      <Widget />
    </Template>
  );
};

const NodeChildrenEditorStory = ({ canvas }: { canvas: boolean }) => {
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
      <NodeChildrenEditor Component={AttributesEditor} />
      <Canvas />
    </div>
  );
};

export const MyKitchenSink = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={`<my-ui-component first="Stencil" last="'Don't call me a framework' JS" picked-date="1649799530937" text-color="#F00"></my-ui-component>`}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const Mint = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={mintMono}
      startingPackages={MintComponents}
      Molecule={ConfigMolecule}
    >
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
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
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

function AttributesEditor() {
  return (
    <div data-attributes-editor>
      <TagName />
      {/* <table>
        <tbody>
          <AttributesController Component={AttributeComponent} />
        </tbody>
      </table> */}
      <AttributesController />
      <Debugging />
    </div>
  );
}

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

const AttributeComponent = () => {
  const { name } = useMolecule(AttributeMolecule);

  return (
    <Fragment key={name}>
      <tr>
        <td>
          <AttributeEditor />
        </td>
      </tr>
    </Fragment>
  );
};

function AttributeEditor() {
  const { name, schemaAtom, valueAtom } = useMolecule(AttributeMolecule);
  const schema = useAtomValue(schemaAtom);
  const [value, setValue] = useAtom(valueAtom);

  if (schema.uiWidget) {
    // TODO: get widgets from uiWidgetsAtom
    const Widget = widgets[schema.uiWidget as keyof Widgets];
    return <Widget />;
  }

  if (value === undefined) {
    return (
      <div>
        <b>{schema.title ?? name}</b>{' '}
        <button onClick={() => setValue(schema?.default?.toString() ?? '')}>
          Edit
        </button>
      </div>
    );
  }

  if (schema.enum) {
    return (
      <div>
        <b>{schema.title ?? name}</b>{' '}
        <select>
          {schema.enum.map((value, idx) => (
            <option value={value}>{schema.enumNames?.[idx] || value}</option>
          ))}
        </select>
        <Clear />
        <div style={{ color: 'grey' }}>{schema.description}</div>
      </div>
    );
  }

  if (schema?.type === 'boolean') {
    return (
      <div>
        <b>{schema.title ?? name}</b>{' '}
        <input
          type="checkbox"
          checked={value === undefined || value === null ? false : true}
          onChange={(e) =>
            setValue(
              // ''
              (e.target as HTMLInputElement).checked ? '' : undefined
            )
          }
        />
        <Clear />
        <div style={{ color: 'grey' }}>{schema.description}</div>
      </div>
    );
  }
  if (schema?.type === 'number') {
    return (
      <div>
        <b>{schema.title ?? name}</b>{' '}
        <input
          type="number"
          value={value}
          onInput={(e) =>
            setValue((e.target as HTMLInputElement).value.toString())
          }
        />
        <Clear />
        <div style={{ color: 'grey' }}>{schema.description}</div>
      </div>
    );
  }
  return (
    <div>
      {' '}
      <b>{schema.title ?? name}</b>{' '}
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
      <Clear />
      <div style={{ color: 'grey' }}>{schema.description}</div>
    </div>
  );
}
