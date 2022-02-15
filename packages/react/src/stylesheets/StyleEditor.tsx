import { cssUtil, StyleNodeProps } from '@raisins/core';
import * as Css from 'css-tree';
import React, { FormEvent } from 'react';
import { StateUpdater } from '../util/NewState';
import { useStyleEditor } from './useStyleEditor';

const { createChildUpdater, createUpdater } = cssUtil;
export function StyleEditor() {
  const model = useStyleEditor();

  if (!model.sheets) {
    return <div>No stylesheets</div>;
  }
  return (
    <div>
      Sheets:
      {model.sheets.map((s, i) => {
        const isSelected = s === model.selectedSheet;
        return (
          <div
            onClick={() => model.setSelectedsheet(s)}
            style={{ fontWeight: isSelected ? 'bold' : 'normal' }}
          >
            Sheet {i}
          </div>
        );
      })}
      {model.selectedSheet && (
        <StyleNodeEditor
          node={model.selectedSheet.contents!}
          setNode={model.updateSelectedSheet}
        />
      )}
    </div>
  );
}

export function StyleNodeEditor(props: StyleNodeProps) {
  const { node } = props;
  const { type } = node;
  if (!type) return <EmptyState {...props} />;
  switch (type) {
    case 'AnPlusB':
      <div />;
  }
  if (type === 'Function')
    return (
      <FunctionEditor {...(props as StyleNodeProps<Css.FunctionNodePlain>)} />
    );
  if (type === 'StyleSheet')
    return (
      <StylesheetEditor {...(props as StyleNodeProps<Css.StyleSheetPlain>)} />
    );
  if (type === 'Rule')
    return <RuleEditor {...(props as StyleNodeProps<Css.RulePlain>)} />;
  if (type === 'Block')
    return <BlockEditor {...(props as StyleNodeProps<Css.BlockPlain>)} />;
  if (type === 'Declaration')
    return (
      <DeclarationEditor {...(props as StyleNodeProps<Css.DeclarationPlain>)} />
    );
  if (type === 'DeclarationList')
    return (
      <DeclarationListEditor
        {...(props as StyleNodeProps<Css.DeclarationListPlain>)}
      />
    );
  if (type === 'Raw')
    return <RawEditor {...(props as StyleNodeProps<Css.Raw>)} />;
  if (type === 'Value')
    return <ValueEditor {...(props as StyleNodeProps<Css.ValuePlain>)} />;
  if (type === 'Identifier')
    return <IdentifierEditor {...(props as StyleNodeProps<Css.Identifier>)} />;
  if (type === 'SelectorList')
    return (
      <SelectorListEditor
        {...(props as StyleNodeProps<Css.SelectorListPlain>)}
      />
    );
  if (type === 'Selector')
    return <SelectorEditor {...(props as StyleNodeProps<Css.SelectorPlain>)} />;
  if (type === 'TypeSelector')
    return (
      <TypeSelectorEditor {...(props as StyleNodeProps<Css.TypeSelector>)} />
    );
  if (type === 'ClassSelector')
    return (
      <ClassSelectorEditor {...(props as StyleNodeProps<Css.ClassSelector>)} />
    );
  if (type === 'PseudoClassSelector')
    return (
      <PseudoClassSelectorEditor
        {...(props as StyleNodeProps<Css.PseudoClassSelectorPlain>)}
      />
    );
  if (type === 'Dimension')
    return <DimensionEditor {...(props as StyleNodeProps<Css.Dimension>)} />;
  if (type === 'WhiteSpace')
    return <WhiteSpaceEditor {...(props as StyleNodeProps<Css.WhiteSpace>)} />;
  return (
    <div>
      "{type}" is unhandled <details>{JSON.stringify(node)}</details>
    </div>
  );
}

function EmptyState(_: StyleNodeProps) {
  return <div />;
}
function StylesheetEditor(props: StyleNodeProps<Css.StyleSheetPlain>) {
  const { node } = props;

  return (
    <div data-type={props.node.type}>
      <Children {...props} />
      <details>
        StyleSheet!
        <pre>{JSON.stringify(node, null, 2)}</pre>
      </details>
    </div>
  );
}

function RuleEditor(props: StyleNodeProps<Css.RulePlain>) {
  const setPrelude = createUpdater<
    Css.RulePlain,
    Css.SelectorListPlain | Css.Raw
  >(
    props,
    (prev) => prev.prelude,
    (prev, next) => (prev.prelude = next)
  );
  const setBlock = createUpdater<Css.RulePlain, Css.BlockPlain>(
    props,
    (prev) => prev.block,
    (prev, next) => (prev.block = next)
  );

  return (
    <div data-type={props.node.type}>
      <StyleNodeEditor node={props.node.prelude} setNode={setPrelude as any} />
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

function PseudoClassSelectorEditor(
  props: StyleNodeProps<Css.PseudoClassSelectorPlain>
) {
  return <span data-type={props.node.type}>::{props.node.name}</span>;
}

function DeclarationEditor(props: StyleNodeProps<Css.DeclarationPlain>) {
  const setValue = createUpdater<
    Css.DeclarationPlain,
    Css.ValuePlain | Css.Raw
  >(
    props,
    (prev) => prev.value,
    (prev, next) => (prev.value = next)
  );
  return (
    <div data-type={props.node.type}>
      {props.node.property} :{' '}
      <StyleNodeEditor node={props.node.value} setNode={setValue as any} />
    </div>
  );
}

function DeclarationListEditor(
  props: StyleNodeProps<Css.DeclarationListPlain>
) {
  return (
    <div data-type={props.node.type}>
      <Children {...(props as any)} />
    </div>
  );
}

function RawEditor(props: StyleNodeProps<Css.Raw>) {
  const onInput = (e: FormEvent<unknown>) => {
    const next = (e.target as HTMLInputElement).value;
    props.setNode((current: Css.Raw | undefined) => {
      current;
      return { type: 'Raw', value: next };
    });
  };
  return (
    <input
      type="text"
      value={props.node.value}
      onInput={onInput}
      data-type={props.node.type}
    />
  );
}

function ValueEditor(props: StyleNodeProps<Css.ValuePlain>) {
  return <Children {...(props as any)} />;
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

type HasChildrenNodes = {
  children: Css.CssNodePlain[];
};

/**
 * Renders children, with the right mutation wired up
 *
 * @param props Re
 * @returns
 */
export function Children<T extends Css.CssNodePlain & HasChildrenNodes>(
  props: StyleNodeProps<T>
): JSX.Element {
  const { setNode } = props;
  return (
    <>
      {
        // TODO: Add React Key by using atoms
        props.node.children.map((n: Css.CssNodePlain, idx: number) => {
          const subUpdate: StateUpdater<Css.CssNodePlain> = createChildUpdater(
            setNode as any,
            idx
          );
          return <StyleNodeEditor node={n} setNode={subUpdate} />;
        })
      }
    </>
  );
}
