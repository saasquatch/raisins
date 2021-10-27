import {
  htmlUtil,
  RaisinDocumentNode,
  RaisinNode,
  RaisinStyleNode,
} from '@raisins/core';
import * as css from 'css-tree';
import { useAtomValue } from 'jotai/utils';
import { useMemo, useState } from 'react';
import { ComponentModelAtom } from '../component-metamodel/ComponentModel';
import { StateUpdater } from '../util/NewState';

const { IdentityVisitor, replace, visit } = htmlUtil;

type Props = {
  node: RaisinNode;
  setNode: StateUpdater<RaisinNode>;
};

// TODO: Color functions: https://github.com/scttcper/tinycolor
export function useStyleEditor(props: Props) {
  const componentModel = useAtomValue(ComponentModelAtom);
  const sheets = useMemo(() => {
    // Finds all style nodes.
    const nodes: RaisinStyleNode[] = [];
    visit(props.node, {
      ...IdentityVisitor,
      onStyle: (n) => {
        nodes.push(n);
        return n;
      },
    });
    return nodes;
  }, [props.node]);

  // TOOD: This is volatile to Undo / Redo. It should reset based on Undo/Redo, but instead is cached
  const [selectedSheet, setSelectedsheet] = useState<
    RaisinStyleNode | undefined
  >(undefined);

  const updateSelectedSheet: StateUpdater<css.CssNodePlain> = (next) => {
    props.setNode(
      // @ts-ignore
      (prev: RaisinDocumentNode) => {
        const nextVal =
          typeof next === 'function' ? next(selectedSheet!.contents!) : next;
        const newSheet: RaisinStyleNode = {
          ...selectedSheet!,
          contents: nextVal,
        };
        setSelectedsheet(newSheet);
        return replace(prev, selectedSheet!, newSheet);
        // return prev;
      }
    );
  };
  return {
    sheets,
    selectedSheet,
    setSelectedsheet,
    updateSelectedSheet,
    // styleString: csstree.generate(csstree.fromPlainObject(fakeCSS), {}),
  };
}
