import {
  getNode,
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import React, { ChangeEventHandler, useMemo, useRef } from 'react';
import { useNodeAtom } from '../atoms/node-context';
import { Model } from '../model/EditorModel';
import {
  useProseEditorOnAtom,
  useSelectionAtom,
} from '../prosemirror/ProseEditor';
import { isElementNode, isTextNode } from '../util/isNode';
import { useValueAtom } from '../atoms/useValueAtom';

const { replacePath } = htmlUtil;
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
  const nodeAtom = useValueAtom(node);

  const selection = useSelectionAtom();
  const path = model.getPath(node);

  // Atom doesn't use get or set, so it's safe to be synthetic and different every render?
  const docNodeAtom = useRef(
    atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
      (get) => {
        return {
          type: ElementType.Root,
          children: get(nodeAtom).children,
        };
      },
      (get, set, next) => {
        model.setNode((prev) => {
          const prevNode = getNode(prev, path);
          const prevDocNode = {
            type: ElementType.Root,
            children: node.children,
          } as RaisinDocumentNode;
          const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
          const nextNode = {
            ...prevNode,
            children: nextVal.children,
          };
          return replacePath(prev, path, nextNode);
        });
      }
    )
  ).current;

  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);

  return <div ref={mountRef} />;
}

export function useRichTextEditorForAtom() {
  const nodeAtom = (useNodeAtom() as unknown) as PrimitiveAtom<RaisinElementNode>;
  const docNodeAtom = useMemo(
    () =>
      atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
        (get) => {
          return {
            type: ElementType.Root,
            children: get(nodeAtom).children,
          };
        },
        (get, set, next) => {
          const prevNode = get(nodeAtom);
          const prevDocNode = {
            type: ElementType.Root,
            children: prevNode.children,
          } as RaisinDocumentNode;
          const nextVal = typeof next === 'function' ? next(prevDocNode) : next;
          const nextNode = {
            ...prevNode,
            children: nextVal.children,
          };
          set(nodeAtom, nextNode);
        }
      ),
    [nodeAtom]
  );
  const selection = useSelectionAtom();
  const { mountRef } = useProseEditorOnAtom(docNodeAtom, selection);
  return { mountRef };
}

/**
 * A controller for editing rich text via a Prose Editor
 *
 * @returns
 */
export function RichTextEditorForAtom() {
  const { mountRef } = useRichTextEditorForAtom();
  return <div ref={mountRef} />;
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
