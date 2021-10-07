import { htmlParser, htmlSerializer, RaisinNode } from '@raisins/core';
import { DOMParser, DOMSerializer } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useMemo, useRef } from 'react';

// TODO: Better memoization
const nodeToString = new WeakMap<RaisinNode, string>();

function memoizedStringify(node: RaisinNode): string {
  if (nodeToString.has(node)) {
    return nodeToString.get(node)!;
  }
  const str = htmlSerializer(node);
  nodeToString.set(node, str);
  return str;
}

export default function ProseEditor({
  node,
  setNode,
}: {
  node: RaisinNode;
  setNode: React.Dispatch<RaisinNode>;
}) {
  let content = memoizedStringify(node);
  let initialState = useMemo(
    () =>
      EditorState.create({
        schema,
        doc: DOMParser.fromSchema(schema).parse(stringToNativeDom(content)),
      }),
    [schema]
  );
  const viewRef = useRef<EditorView>();
  function mountRef(el: HTMLDivElement) {
    const make = () =>
      new EditorView(el, {
        state: initialState,
        dispatchTransaction(trans) {
          const nextState = initialState.applyTransaction(trans);

          const node = nextState.state.doc.content.firstChild;
          const html = DOMSerializer.fromSchema(schema).serializeNode(node!);
          const raisinNode = htmlParser(nativeDomToString(html));
          // @ts-ignore
          setNode(raisinNode);
          viewRef.current?.update(nextState);
        },
      });

    if (!viewRef.current && el) {
      viewRef.current = make();
    }
    if (viewRef.current && el) {
      // Destory and replace
      viewRef.current.destroy();
      viewRef.current = make();
    }
  }

  return <div ref={mountRef} />;
}

/**
 * Parses a string into native DOM
 *
 * @param html
 * @returns
 */
function stringToNativeDom(html: string) {
  const tmpl = document.createElement('template');

  // Parsing happens here
  tmpl.innerHTML = html;

  return tmpl.content;
}

function nativeDomToString(node: any) {
  const tmpl = document.createElement('template');
  tmpl.content.appendChild(node);

  return tmpl.innerHTML;
}
