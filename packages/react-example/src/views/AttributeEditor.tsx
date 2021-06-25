import { RaisinElementNode } from '@raisins/core';
import { Model } from "../model/EditorModel";
import SlDetails from "@shoelace-style/react/dist/details";
import React from "react";

export function AttributesEditor(props: { model: Model; node: RaisinElementNode }) {
  const schema = props.model.getComponentMeta(props.node)?.attributes;
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
  const allProps = new Set([...Object.keys(attribs), ...Object.keys(schema?.properties || {})]);
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
          {allPropKeys.map(key => {
            return (
              <tr>
                <td>{key}</td>
                <td>
                  <AttributeEditor model={props.model} attr={{ key, value: attribs[key] }} onChange={onchange(key)} />
                </td>
              </tr>
            );
          })}
        </tbody>
        <tbody></tbody>
      </table>
      <SlDetails summary="Debugging">
        Attributes: <br />
        <pre style={{ overflow: 'scroll' }}>{JSON.stringify(props.node.attribs, null, 2)}</pre>
        Schema:
        <br />
        <pre>{JSON.stringify(schema)}</pre>
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
  return <input type="text" value={props.attr.value} onInput={e => props.onChange((e.target as HTMLInputElement).value)} />;
}
