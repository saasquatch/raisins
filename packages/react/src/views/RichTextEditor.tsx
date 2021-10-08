import { ElementType } from 'domelementtype';
import React, { ChangeEventHandler, useState } from 'react';
import { propsModule } from 'snabbdom';
import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '../../../core/dist';
import { Model } from '../model/EditorModel';
import ControlledProseEditor, {
  ProseTextSelection,
  RaisinProseState,
} from '../ProseEditor';
import { isElementNode, isTextNode } from './isNode';

export default function RichTextEditor(props: Model) {
  const { selected } = props;

  if (!isElementNode(selected)) return <div>Not an element</div>;

  const element = selected;
  return <TextNodesEditor element={element} model={props} />;
}

export function TextNodesEditor({
  element,
  model,
}: {
  element: RaisinElementNode;
  model: Model;
}) {
  return (
    <div>
      <WithSelectionEditor node={element} model={model} />
      <ul>
        {element.children.filter(isTextNode).map((c) => {
          return <TextNodeEditor node={c} model={model} />;
        })}
      </ul>
    </div>
  );
}

/**
 * Manage prose selection state locally (for the time being).
 *
 * This state should be pulled up to the top
 */
export function WithSelectionEditor({
  node,
  model,
}: {
  node: RaisinNodeWithChildren;
  model: Model;
}) {
  const [selection, setSelect] = useState<ProseTextSelection>();
  const rootNode: RaisinDocumentNode = {
    type: ElementType.Root,
    children: node.children,
  };

  const setState: React.Dispatch<React.SetStateAction<RaisinProseState>> = (
    next
  ) => {
    // TODO: This state rendering seems to suffer from selection bias.
    const previousstate: RaisinProseState = {
      selection,
      node: rootNode,
    };
    const nextVal = typeof next === 'function' ? next(previousstate) : next;

    setSelect(nextVal.selection);
    const nextNode = {
      ...node,
      children: nextVal.node.children,
    };
    model.replaceNode(node, nextNode);
  };
  const state: RaisinProseState = {
    selection,
    node: rootNode,
  };
  return <ControlledProseEditor {...{ state, setState }} />;
}

export function TextNodeEditor({
  node,
  model,
}: {
  node: RaisinTextNode;
  model: Model;
}) {
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const nextValue: RaisinTextNode = {
      type: ElementType.Text,
      data: e.target.value,
    };
    model.replaceNode(node, nextValue);
  };

  return (
    <li>
      <input type="text" value={node.data} onChange={onChange} />
    </li>
  );
}
