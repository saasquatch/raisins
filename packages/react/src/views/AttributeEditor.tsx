import { RaisinElementNode } from '@raisins/core';
import SlDetails from '@shoelace-style/react/dist/details';
import React from 'react';
import { Model } from '../model/EditorModel';
import styled from 'styled-components';
import { Attribute } from '@raisins/schema/schema';
import { useAtomValue } from 'jotai/utils';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';

const Descr = styled.span`
  color: grey;
  font-size: 0.7em;
`;
export function AttributesEditor(props: {
  model: Model;
  node: RaisinElementNode;
}) {
  const comp = useAtomValue(ComponentModelAtom);

  const attributeSchema = comp.getComponentMeta(props.node)?.attributes ?? [];
  const attribs = props.node.attribs || {};
  const onchange = (key: string) => {
    return (value: string) => {
      const attrbsClone = { ...props.node.attribs };
      if (value === undefined) {
        delete attrbsClone[key];
      } else {
        attrbsClone[key] = value;
      }
      const clone = {
        ...props.node,
        attribs: attrbsClone,
      };
      props.model.replaceNode(props.node, clone);
    };
  };
  return (
    <div data-attributes-editor>
      <table>
        <tbody>
          {attributeSchema?.map((attr) => {
            return (
              <>
                <tr>
                  <td>
                    <b>{attr.title ?? attr.name}</b>
                    <br />
                    <AttributeEditor
                      schema={attr}
                      model={props.model}
                      attr={{ key: attr.name, value: attribs[attr.name] }}
                      onChange={onchange(attr.name)}
                    />
                  </td>
                </tr>
                {attr.description && (
                  <tr>
                    <td colSpan={2}>
                      <Descr>{attr.description}</Descr>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
      <SlDetails summary="Debugging">
        Attributes: <br />
        <pre style={{ overflow: 'scroll' }}>
          {JSON.stringify(props.node.attribs, null, 2)}
        </pre>
        Schema:
      </SlDetails>
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
  model: Model;
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
