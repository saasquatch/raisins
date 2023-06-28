import {
  htmlUtil,
  RaisinDocumentNode,
  RaisinNode,
  RaisinStyleNode,
} from '@raisins/core';
import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useMemo, useState } from 'react';
import { CoreMolecule } from '../core/CoreAtoms';
import { StateUpdater } from '../util/NewState';
import { CssNodePlain } from 'css-tree';

const { IdentityVisitor, replace, visit } = htmlUtil;

type Props = {
  node: RaisinNode;
  setNode: StateUpdater<RaisinNode>;
};

// TODO: Color functions: https://github.com/scttcper/tinycolor
export function useStyleEditor() {
  const { RootNodeAtom } = useMolecule(CoreMolecule);
  const [node, setNode] = useAtom(RootNodeAtom);
  // const componentModel = useAtomValue(ComponentModelAtom);
  const sheets = useMemo(() => {
    // Finds all style nodes.
    const nodes: RaisinStyleNode[] = [];
    visit(node, {
      ...IdentityVisitor,
      onStyle: n => {
        nodes.push(n);
        return n;
      },
    });
    return nodes;
  }, [node]);

  // TOOD: This is volatile to Undo / Redo. It should reset based on Undo/Redo, but instead is cached
  const [selectedSheet, setSelectedsheet] = useState<
    RaisinStyleNode | undefined
  >(undefined);

  const updateSelectedSheet: StateUpdater<CssNodePlain> = next => {
    setNode(
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
