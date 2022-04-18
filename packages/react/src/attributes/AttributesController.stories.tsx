import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React, { Fragment } from 'react';
import { NodeChildrenEditor } from '../node/NodeChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { BasicStory } from '../index.stories';
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
import { Widgets, widgets } from '../examples/MockWidgets';

export default {
  title: 'Attributes Controller',
  argTypes: {
    canvas: {
      control: 'boolean',
    },
  },
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
    >
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const Mint = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintBigStat = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory startingHtml={mintBigStat} startingPackages={MintComponents}>
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintHeroImage = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory startingHtml={mintHeroImage} startingPackages={MintComponents}>
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const MintTaskCard = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory startingHtml={mintTaskCard} startingPackages={MintComponents}>
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const Vanilla = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
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
    >
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

export const Big = ({ canvas }: { canvas: boolean }) => {
  return (
    <BasicStory startingHtml={big} startingPackages={MintComponents}>
      <NodeChildrenEditorStory canvas={canvas} />
    </BasicStory>
  );
};

function AttributesEditor() {
  return (
    <div data-attributes-editor>
      <TagName />
      <table>
        <tbody>
          <AttributesController Component={AttributeComponent} />
        </tbody>
      </table>
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

export const Clear = () => {
  const { clearAtom } = useMolecule(AttributeMolecule);
  const clear = useSetAtom(clearAtom);
  return <button onClick={clear}>x</button>;
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
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);

  if (schema.uiWidget) {
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
