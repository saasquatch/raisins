import { Model, StateUpdater } from '../model/EditorModel';
import { h } from '@stencil/core';
import * as Css from 'css-tree';

export function StyleEditor(model: Model) {
  if (!model.stylesheet) {
    return <div>No stylesheet</div>;
  }
  return <StyleNodeEditor node={model.stylesheet} />;
}

type StyleNodeProps<T extends Css.CssNode = Css.CssNode> = {
  node: T;
  setNode?: StateUpdater<T>;
};

function StyleNodeEditor(props: StyleNodeProps) {
  const { node } = props;
  const { type } = node;
  if (type === 'StyleSheet') return <StylesheetEditor node={node as Css.StyleSheet} />;
  if (type === 'Rule') return <RuleEditor node={node as Css.Rule} />;
  if (type === 'Block') return <BlockEditor node={node as Css.Block} />;
  if (type === 'Declaration') return <DeclarationEditor node={node as Css.Declaration} />;
  if (type === 'Raw') return <RawEditor node={node as Css.Raw} />;
  if (type === 'Value') return <ValueEditor node={node as Css.Value} />;
  if (type === 'Identifier') return <IdentifierEditor node={node as Css.Identifier} />;
  return <div>"{type}" is unhandled</div>;
}

function StylesheetEditor(props: StyleNodeProps<Css.StyleSheet>) {
  const { node } = props;

  let rawSheet: string;
  try {
    rawSheet = Css.generate(node);
  } finally {
  }

  return (
    <div>
      StyleSheet!
      <hr />
      {node.children?.map(n => (
        <StyleNodeEditor node={n} />
      ))}
      <hr />
      <pre style={{ overflow: 'hidden' }}>{rawSheet}</pre>
      <pre>{JSON.stringify(Css.toPlainObject(node), null, 2)}</pre>
    </div>
  );
}

function RuleEditor(props: StyleNodeProps<Css.Rule>) {
  let preludeStr: string;
  try {
    preludeStr = Css.generate(props.node.prelude);
  } finally {
  }
  return (
    <div>
      {preludeStr}
      <hr />
      <StyleNodeEditor node={props.node.block} />
    </div>
  );
}

function BlockEditor(props: StyleNodeProps<Css.Block>) {
  return props.node.children.map(n => <StyleNodeEditor node={n} />);
}

function DeclarationEditor(props: StyleNodeProps<Css.Declaration>) {
  return (
    <div>
      {props.node.property} : <StyleNodeEditor node={props.node.value} />
    </div>
  );
}

function RawEditor(props: StyleNodeProps<Css.Raw>) {
  return <input type="text" value={props.node.value} />;
}

function ValueEditor(props: StyleNodeProps<Css.Value>) {
  return props.node.children.map(n => <StyleNodeEditor node={n} />);
}

function IdentifierEditor(props: StyleNodeProps<Css.Identifier>) {
  return props.node.name;
}
