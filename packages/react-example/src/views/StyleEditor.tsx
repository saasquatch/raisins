import * as Css from 'css-tree';
import { createChildUpdater, createUpdater, HasChildren } from '../core/css-om/cssUtils';
import { Model } from '@raisins/core';
import { StateUpdater } from '../../../core/src/util/NewState';
import { StyleNodeProps } from '../../../core/src/css-om/StyleNodeProps';
import { ReactNode } from 'react';

export function StyleEditor(model: Model) {
  if (!model.sheets) {
    return <div>No stylesheets</div>;
  }
  return (
    <div>
      Sheets:
      {model.sheets.map((s, i) => {
        const isSelected = s === model.selected;
        return (
          <div onClick={() => model.setSelectedsheet(s)} style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
            Sheet {i}
          </div>
        );
      })}
      {model.selectedSheet && <StyleNodeEditor node={model.selectedSheet.contents} setNode={model.updateSelectedSheet} />}
    </div>
  );
}

export function StyleNodeEditor(props: StyleNodeProps) {
  const { node, ...rest } = props;
  const { type } = node;
  if(!type) return <EmptyState {...props}/>
  if (type === 'Function') return <FunctionEditor node={node as Css.FunctionNodePlain} {...rest} />;
  if (type === 'StyleSheet') return <StylesheetEditor node={node as Css.StyleSheetPlain} {...rest} />;
  if (type === 'Rule') return <RuleEditor node={node as Css.RulePlain} {...rest} />;
  if (type === 'Block') return <BlockEditor node={node as Css.BlockPlain} {...rest} />;
  if (type === 'Declaration') return <DeclarationEditor node={node as Css.DeclarationPlain} {...rest} />;
  if (type === 'Raw') return <RawEditor node={node as Css.Raw} {...rest} />;
  if (type === 'Value') return <ValueEditor node={node as Css.ValuePlain} {...rest} />;
  if (type === 'Identifier') return <IdentifierEditor node={node as Css.Identifier} {...rest} />;
  if (type === 'SelectorList') return <SelectorListEditor node={node as Css.SelectorListPlain} {...rest} />;
  if (type === 'Selector') return <SelectorEditor node={node as Css.SelectorPlain} {...rest} />;
  if (type === 'TypeSelector') return <TypeSelectorEditor node={node as Css.TypeSelector} {...rest} />;
  if (type === 'ClassSelector') return <ClassSelectorEditor node={node as Css.ClassSelector} {...rest} />;
  if (type === 'PseudoClassSelector') return <PseudoClassSelectorEditor node={node as Css.PseudoClassSelectorPlain} {...rest} />;
  if (type === 'Dimension') return <DimensionEditor node={node as Css.Dimension} {...rest} />;
  if (type === 'WhiteSpace') return <WhiteSpaceEditor node={node as Css.WhiteSpace} {...rest} />;
  return (
    <div>
      "{type}" is unhandled <details>{JSON.stringify(node)}</details>
    </div>
  );
}

function EmptyState(_: StyleNodeProps){
  return <div/>
}
function StylesheetEditor(props: StyleNodeProps<Css.StyleSheetPlain>) {
  const { node } = props;

  let rawSheet: string;
  try {
    // rawSheet = Css.generate(Css.fromPlainObject(node));
  } finally {
  }

  return (
    <div data-type={props.node.type}>
      <Children {...props} />
      <details>
        StyleSheet!
        <pre style={{ overflow: 'hidden' }}>{rawSheet}</pre>
        <pre>{JSON.stringify(node, null, 2)}</pre>
      </details>
    </div>
  );
}

function RuleEditor(props: StyleNodeProps<Css.RulePlain>) {
  const setPrelude = createUpdater<Css.RulePlain, Css.SelectorListPlain | Css.Raw>(
    props,
    prev => prev.prelude,
    (prev, next) => (prev.prelude = next),
  );
  const setBlock = createUpdater<Css.RulePlain, Css.BlockPlain>(
    props,
    prev => prev.block,
    (prev, next) => (prev.block = next),
  );

  return (
    <div data-type={props.node.type}>
      <StyleNodeEditor node={props.node.prelude} setNode={setPrelude} />
      <BlockEditor node={props.node.block} setNode={setBlock} />
    </div>
  );
}

function BlockEditor(props: StyleNodeProps<Css.BlockPlain>) {
  return (
    <div data-type={props.node.type}>
      {'{'}
      <div style={{ paddingLeft: '20px;' }}>
        <Children {...props} />
      </div>
      {'}'}
    </div>
  );
}

function FunctionEditor(props: StyleNodeProps<Css.FunctionNodePlain>) {
  return (
    <span>
      {props.node.name}(<Children {...props} />)
    </span>
  );
}

function SelectorListEditor(props: StyleNodeProps<Css.SelectorListPlain>) {
  return <Children {...props} />;
}

function SelectorEditor(props: StyleNodeProps<Css.SelectorPlain>) {
  return <Children {...props} />;
}

function TypeSelectorEditor(props: StyleNodeProps<Css.TypeSelector>) {
  return <span data-type={props.node.type}>{props.node.name}</span>;
}

function ClassSelectorEditor(props: StyleNodeProps<Css.ClassSelector>) {
  return <span data-type={props.node.type}>.{props.node.name}</span>;
}

function PseudoClassSelectorEditor(props: StyleNodeProps<Css.PseudoClassSelectorPlain>) {
  return <span data-type={props.node.type}>::{props.node.name}</span>;
}

function DeclarationEditor(props: StyleNodeProps<Css.DeclarationPlain>) {
  const setValue = createUpdater<Css.DeclarationPlain, Css.ValuePlain | Css.Raw>(
    props,
    prev => prev.value,
    (prev, next) => (prev.value = next),
  );
  return (
    <div data-type={props.node.type}>
      {props.node.property} : <StyleNodeEditor node={props.node.value} setNode={setValue} />
    </div>
  );
}

function RawEditor(props: StyleNodeProps<Css.Raw>) {
  const onInput = (e: InputEvent) => {
    const next = (e.target as HTMLInputElement).value;
    props.setNode(current => {
      // console.log('Next CSS', next);
      return { ...current, value: next };
    });
  };
  return <input type="text" value={props.node.value} onInput={onInput} data-type={props.node.type} />;
}

function ValueEditor(props: StyleNodeProps<Css.ValuePlain>) {
  return <Children {...props} />;
}

function IdentifierEditor(props: StyleNodeProps<Css.Identifier>) {
  return <span data-type={props.node.type}>{props.node.name}</span>;
}

function DimensionEditor(props: StyleNodeProps<Css.Dimension>) {
  return (
    <span data-type={props.node.type}>
      {props.node.value}
      {props.node.unit}
    </span>
  );
}

function WhiteSpaceEditor(props: StyleNodeProps<Css.WhiteSpace>) {
  return <span data-type={props.node.type}>{props.node.value}</span>;
}

/**
 * Renders children, with the right mutation wired up
 *
 * @param props Re
 * @returns
 */
export function Children(props: StyleNodeProps<HasChildren>): ReactNode {
  return props.node.children.map((n:Css.CssNodePlain, idx:number) => {
    const subUpdate: StateUpdater<Css.CssNodePlain> = createChildUpdater(props.setNode, idx);
    return <StyleNodeEditor node={n} setNode={subUpdate} />;
  });
}
