import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React, { Fragment } from 'react';
import { NodeChildrenEditor } from '../node/NodeChildrenEditor';
import { NodeMolecule } from '../node/NodeMolecule';
import { BasicStory } from '../index.stories';
import { big, MintComponents, mintMono } from '../examples/MintComponents';
import { AttributeMolecule } from './AttributeMolecule';
import { AttributesController } from './AttributesController';

export default {
  title: 'Attributes Controller',
};

export const Mint = () => {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
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
          <b>{schema.title ?? name}</b>
          <br />
          <AttributeEditor />
        </td>
      </tr>
      {schema.description && (
        <tr>
          <td colSpan={2}>
            <span style={{ color: 'grey' }}>{schema.description}</span>
          </td>
        </tr>
      )}
    </Fragment>
  );
};

function AttributeEditor() {
  const { schemaAtom, valueAtom } = useMolecule(AttributeMolecule);
  const [value, setValue] = useAtom(valueAtom);
  const schema = useAtomValue(schemaAtom);

  if (value === undefined) {
    return (
      <div>
        {schema?.default ?? <i>Empty</i>}
        <button onClick={() => setValue(schema?.default?.toString() ?? '')}>
          Edit
        </button>
      </div>
    );
  }

  if (schema?.type === 'boolean') {
    return (
      <div>
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
      </div>
    );
  }
  if (schema?.type === 'number') {
    return (
      <div>
        <input
          type="number"
          value={value}
          onInput={(e) =>
            setValue((e.target as HTMLInputElement).value.toString())
          }
        />
        <Clear />
      </div>
    );
  }
  return (
    <div>
      <input
        type="text"
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value)}
      />
      <Clear />
    </div>
  );
}
