import { useMemo, useState } from '@saasquatch/universal-hooks';
import { RaisinNode, RaisinNodeWithChildren, RaisinStyleNode } from '../core/html-dom/RaisinNode';
import { IdentityVisitor, replace, visit } from '../core/html-dom/util';
import { StateUpdater } from '../util/NewState';
import { ComponentModel } from './useComponentModel';
import * as css from 'css-tree';

type Props = { node: RaisinNode; setNode: StateUpdater<RaisinNode>; parents: WeakMap<RaisinNode, RaisinNodeWithChildren>; componentModel: ComponentModel };

export function useStyleEditor(props: Props) {
  const sheets = useMemo(() => {
    // Finds all style nodes.
    const nodes: RaisinStyleNode[] = [];
    visit(props.node, {
      ...IdentityVisitor,
      onStyle: n => {
        nodes.push(n);
        return n;
      },
    });
    return nodes;
  }, [props.node]);

  const [selectedSheet, setSelectedsheet] = useState<RaisinStyleNode>(undefined);
  const updateSelectedSheet = (next: css.CssNodePlain) => {
    props.setNode(prev => {
      const newSheet = { ...selectedSheet, cssContents: next };
      return replace(prev, selectedSheet, newSheet);
    });
  };
  return {
    sheets,
    selectedSheet,
    setSelectedsheet,
    updateSelectedSheet,
    // styleString: csstree.generate(csstree.fromPlainObject(fakeCSS), {}),
  };
}
