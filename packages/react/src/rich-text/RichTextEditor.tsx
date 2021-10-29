import {
  getNode,
  htmlUtil,
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNodeWithChildren,
} from '@raisins/core';
import { ElementType } from 'domelementtype';
import { atom, PrimitiveAtom, SetStateAction } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import React, { useMemo, useRef } from 'react';
import { useNodeAtom } from '../node/node-context';
import { RaisinScope } from '../atoms/RaisinScope';
import { useAtomFromRenderValue } from '../atoms/useValueAtom';
import { IdentifierModelAtom, RootNodeAtom } from '../hooks/CoreAtoms';
import {
  useProseEditorOnAtom,
} from '../prosemirror/ProseEditor';
import { useSelectionAtom } from "../prosemirror/useSelectionAtom";
import { SelectedNodeAtom } from '../selection/SelectedAtom';
import { isElementNode } from '../util/isNode';

const { replacePath } = htmlUtil;

export default function RichTextEditor() {
  const selected = useAtomValue(SelectedNodeAtom, RaisinScope);
  if (!isElementNode(selected)) return <div>Not an element</div>;

  const element = selected;
  return <WithSelectionEditor node={element} />;
}

/**
 * Manage prose selection state locally (for the time being).
 *
 * This state should be pulled up to the top
 */
export function WithSelectionEditor({
  node,
}: {
  node: RaisinNodeWithChildren;
}) {
  const nodeAtom = useAtomFromRenderValue(node, RaisinScope);
  const selection = useSelectionAtom();
  const { getPath } = useAtomValue(IdentifierModelAtom, RaisinScope);
  const path = getPath(node);

  // Atom doesn't use get or set, so it's safe to be synthetic and different every render?
  const docNodeAtom = useRef(
    atom<RaisinDocumentNode, SetStateAction<RaisinDocumentNode>>(
      (get) => {
        return {
          type: ElementType.Root,
          children: get(nodeAtom).children,
        };
      },
      (_, set, next) => {
        set(RootNodeAtom, (prev) => {
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
