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

export default {
  title: 'Attributes Controller',
};

export const MyKitchenSink = () => {
  return (
    <BasicStory
      startingHtml={`<my-ui-component first="Stencil" last="'Don't call me a framework' JS" picked-date="1649799530937" text-color="#F00"></my-ui-component>`}
      startingPackages={MintComponents}
    >
      <NodeChildrenEditor Component={AttributesEditor} />
    </BasicStory>
  );
};

export const Mint = () => {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
      <NodeChildrenEditor Component={AttributesEditor} />
    </BasicStory>
  );
};

export const MintBigStat = () => {
  return (
    <BasicStory startingHtml={mintBigStat} startingPackages={MintComponents}>
      <NodeChildrenEditor Component={AttributesEditor} />
    </BasicStory>
  );
};

export const MintHeroImage = () => {
  return (
    <BasicStory startingHtml={mintHeroImage} startingPackages={MintComponents}>
      <NodeChildrenEditor Component={AttributesEditor} />
    </BasicStory>
  );
};

export const MintHeroImageWithCanvas = () => {
  return (
    <BasicStory startingHtml={mintHeroImage} startingPackages={MintComponents}>
      <div style={{ display: 'flex' }}>
        <NodeChildrenEditor Component={AttributesEditor} />
        <div style={{ flex: 1 }}>
          <CanvasController />
        </div>
      </div>
    </BasicStory>
  );
};

export const MintTaskCard = () => {
  return (
    <BasicStory startingHtml={mintTaskCard} startingPackages={MintComponents}>
      <NodeChildrenEditor Component={AttributesEditor} />
    </BasicStory>
  );
};

export const Big = () => {
  return (
    <BasicStory startingHtml={big} startingPackages={MintComponents}>
      <NodeChildrenEditor Component={AttributesEditor} />
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

const Clear = () => {
  const { clearAtom } = useMolecule(AttributeMolecule);
  const clear = useSetAtom(clearAtom);
  return <button onClick={clear}>x</button>;
};

const AttributeComponent = () => {
  const { name, schemaAtom } = useMolecule(AttributeMolecule);
  const schema = useAtomValue(schemaAtom);

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

const colorStyle = {
  height: '25px',
  width: '25px',

  cursor: 'pointer',
  display: 'inline-block',
  marginLeft: '5px',
};
const ColorWidget = ({ options }) => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  return (
    <div>
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
      <Clear />
      <div>
        <div
          style={{ ...colorStyle, backgroundColor: 'salmon' }}
          onClick={() => setValue('salmon')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'BlanchedAlmond' }}
          onClick={() => setValue('BlanchedAlmond')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'lime' }}
          onClick={() => setValue('lime')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'PeachPuff' }}
          onClick={() => setValue('PeachPuff')}
        ></div>
        <div
          style={{ ...colorStyle, backgroundColor: 'LemonChiffon' }}
          onClick={() => setValue('LemonChiffon')}
        ></div>
      </div>
    </div>
  );
};

const DateRangeWidget = ({ options }) => {
  const { valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  return (
    <div>
      <input
        type="date"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
    </div>
  );
};

function AttributeEditor() {
  const { name, schemaAtom, valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);

  console.log({ name, schema });

  if (schema.uiWidget) {
    if (schema.uiWidget === 'color')
      return <ColorWidget options={schema.uiWidgetOptions} />;
    if (schema.uiWidget === 'DateRange')
      return <DateRangeWidget options={schema.uiWidgetOptions} />;
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

  if (schema?.type === 'boolean') {
    return (
      <div>
        <Title />
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
        <Title />

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
      <Title />
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
