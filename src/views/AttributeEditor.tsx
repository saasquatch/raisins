import { h } from '@stencil/core';
import { Model } from '../model/Dom';
import { RaisinElementNode } from '../model/RaisinNode';

export function AttributesEditor(props: { model: Model; node: RaisinElementNode }) {
  const schema = props.model.getComponentMeta(props.node)?.attributes;

  const onchange = (key: string) => {
    return (value: string) => {
      const clone = {
        ...props.node,
        attribs: { ...props.node.attribs, [key]: value },
      };
      props.model.replaceNode(props.node, clone);
    };
  };
  return (
    <div>
      <AttributeEditor model={props.model} attr={{ key: 'title', value: props.node.attribs?.title }} onChange={onchange('title')} />
      Attributes: <br />
      <pre>{JSON.stringify(props.node.attribs)}</pre>
      Schema:
      <br />
      <pre>{JSON.stringify(schema)}</pre>
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
