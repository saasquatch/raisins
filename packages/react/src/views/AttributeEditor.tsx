import { Attribute } from '@raisins/schema/schema';
import { useAtom, useAtomValue } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React, { Fragment } from 'react';
import { NodeMolecule } from '../node/NodeMolecule';

export function AttributesEditor() {
  const { attributesForNode, componentMetaForNode } = useMolecule(NodeMolecule);
  const [attributes, setAttributes] = useAtom(attributesForNode);
  const attributeSchema = useAtomValue(componentMetaForNode)?.attributes;
  const attribs = attributes ?? {};

  const onchange = (key: string) => {
    return (value: string) => {
      setAttributes((prev) => {
        const attrbsClone = { ...prev };
        if (value === undefined) {
          delete attrbsClone[key];
        } else {
          attrbsClone[key] = value;
        }
        return attrbsClone;
      });
    };
  };
  return (
    <div data-attributes-editor>
      <table>
        <tbody>
          {attributeSchema?.map((attr) => {
            return (
              <Fragment key={attr.name}>
                <tr>
                  <td>
                    <b>{attr.title ?? attr.name}</b>
                    <br />
                    <AttributeEditor
                      schema={attr}
                      attr={{ key: attr.name, value: attribs[attr.name] }}
                      onChange={onchange(attr.name)}
                    />
                  </td>
                </tr>
                {attr.description && (
                  <tr>
                    <td colSpan={2}>
                      <span style={{ color: 'grey' }}>{attr.description}</span>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      <details>
        <summary>Debugging</summary>
        Attributes: <br />
        <pre style={{ overflow: 'scroll' }}>
          {JSON.stringify(attribs, null, 2)}
        </pre>
        Schema:
      </details>
    </div>
  );
}

export function AttributeEditor(props: {
  attr: {
    key: string;
    value: any;
  };
  onChange: (next: any) => void;
  schema?: Attribute;
}) {
  if (props.attr.value === undefined) {
    return (
      <div>
        {props.schema?.default ?? <i>Empty</i>}
        <button
          onClick={() =>
            props.onChange(props.schema?.default?.toString() ?? '')
          }
        >
          Edit
        </button>
      </div>
    );
  }
  const Reset = () => (
    <button onClick={() => props.onChange(undefined)}>x</button>
  );
  if (props.schema?.type === 'boolean') {
    return (
      <div>
        <input
          type="checkbox"
          checked={
            props.attr.value === undefined || props.attr.value === null
              ? false
              : true
          }
          onChange={(e) =>
            props.onChange(
              // ''
              (e.target as HTMLInputElement).checked ? '' : undefined
            )
          }
        />
        <Reset />
      </div>
    );
  }
  if (props.schema?.type === 'number') {
    return (
      <div>
        <input
          type="number"
          value={props.attr.value}
          onInput={(e) =>
            props.onChange((e.target as HTMLInputElement).value.toString())
          }
        />
        <Reset />
      </div>
    );
  }
  return (
    <div>
      <input
        type="text"
        value={props.attr.value}
        onInput={(e) => props.onChange((e.target as HTMLInputElement).value)}
      />
      <Reset />
    </div>
  );
}
