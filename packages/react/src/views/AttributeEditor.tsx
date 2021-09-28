import { RaisinElementNode } from '@raisins/core';
import SlDetails from '@shoelace-style/react/dist/details';
import React from 'react';
import { Model } from '../model/EditorModel';
import styled from 'styled-components';

const Descr = styled.span`
  color: grey;
  font-size: 0.6em;
`;
export function AttributesEditor(props: {
  model: Model;
  node: RaisinElementNode;
}) {
  const attributeSchema =
    props.model.getComponentMeta(props.node)?.attributes ?? [];
  const attribs = props.node.attribs || {};
  const onchange = (key: string) => {
    return (value: string) => {
      const clone = {
        ...props.node,
        attribs: { ...props.node.attribs, [key]: value },
      };
      props.model.replaceNode(props.node, clone);
    };
  };
  const allProps = new Set([
    ...Object.keys(attribs),
    ...attributeSchema?.map((a) => a.name),
  ]);
  const allPropKeys = [...allProps.values()];
  return (
    <div data-attributes-editor>
      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {attributeSchema?.map((attr) => {
            return (
              <>
                <tr>
                  <th>
                    {attr.title ?? attr.name}
                    <br />
                  </th>
                  <td>
                    <AttributeEditor
                      model={props.model}
                      attr={{ key: attr.name, value: attribs[attr.name] }}
                      onChange={onchange(attr.name)}
                    />
                  </td>
                </tr>
                {attr.description && (
                  <tr>
                    <td colSpan={2}><Descr>{attr.description}</Descr></td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
        <tbody></tbody>
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
  model: Model;
}) {
  return (
    <input
      type="text"
      value={props.attr.value}
      onInput={(e) => props.onChange((e.target as HTMLInputElement).value)}
    />
  );
}
