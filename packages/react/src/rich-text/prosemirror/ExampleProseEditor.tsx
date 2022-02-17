import { RaisinDocumentNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import React from 'react';
import { ProseTextSelection, useProseEditorOnAtom } from './ProseEditor';


export function ExampleProseEditor(props: {
  nodeAtom: PrimitiveAtom<RaisinDocumentNode>;
  selectionAtom: PrimitiveAtom<ProseTextSelection | undefined>;
}) {
  return (
    <ProseEditorView2
      {...useProseEditorOnAtom(props.nodeAtom, props.selectionAtom)} />
  );
}
function ProseEditorView2({
  mountRef,
}: {
  mountRef: (el: HTMLElement | null) => void;
}) {
  return (
    <>
      <div ref={mountRef} />
    </>
  );
}
