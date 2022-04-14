import { htmlParser } from '@raisins/core';
import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import React from 'react';
import { NewLinePlugin } from './plugins/NewLineBreak';
import { ProseEditor } from './ProseEditor';
import {
  ProseEditorScopeProps,
  ProseEditorScopeProvider,
  ProseEditorScopeType,
  ProseTextSelection,
} from './ProseEditorScope';
import { inlineSchema } from './ProseSchemas';
import { ProseToggleMarkMolecule } from './ProseToggleMarkMolecule';

export default { title: 'Prose Editor' };

const proseAtom: ProseEditorScopeType = atom(() => {
  const props: ProseEditorScopeProps = {
    node: atom(
      htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a>`
      )
    ),
    plugins: atom([NewLinePlugin()]),
    schema: atom(inlineSchema),
    selection: atom(undefined as ProseTextSelection | undefined),
  };
  return props;
});

export const Paragraph = () => (
  <ProseEditorScopeProvider value={proseAtom}>
    <ProseEditor />
  </ProseEditorScopeProvider>
);

export const MarkDetections = () => {
  return (
    <pre>
      {`
      Scenario: Mark detection is active
      When you select something in bold
      Then the bold button should show that bold is activated
      `}
    </pre>
  );
};
export const StoredMarks = () => {
  return (
    <pre>
      {`
      Scenario: StoredMarks work
      Given your input area is empty
      When you press the bold button
      Then the bold button shows as active
      When you type something
      Then it shows up in bold
      `}
    </pre>
  );
};
export const SynchronizedState = () => (
  <ProseEditorScopeProvider value={proseAtom}>
    <ProseEditor />
    <ProseEditor />
  </ProseEditorScopeProvider>
);

export const SynchronizedState2 = () => (
  <>
    <ProseEditorScopeProvider value={proseAtom}>
      <ProseEditor />
    </ProseEditorScopeProvider>
    <ProseEditorScopeProvider value={proseAtom}>
      <ProseEditor />
    </ProseEditorScopeProvider>
  </>
);

export const WithToolbar = () => (
  <ProseEditorScopeProvider value={proseAtom}>
    <pre>{`
      Scenario: Text area remains focused

      Without special consideration, clicking on the toolbar will pull away the focus from the textarea

      Given there is text in my textarea
      When I select something
      And click the bold button
      Then my textarea is still focused
      When I type
      Then it modifies the text
    `}</pre>
    <Toolbar />
    <ProseEditor />
  </ProseEditorScopeProvider>
);

export const WithToolbarSynchronized = () => (
  <>
    <WithToolbar />
    <WithToolbar />
  </>
);
const Toolbar = () => {
  const ToggleMarks = useMolecule(ProseToggleMarkMolecule);
  const toggle = useSetAtom(ToggleMarks.toggleMarkAtom);

  return (
    <>
      <button
        onMouseDown={(e) => toggle({ e, mark: inlineSchema.marks.strong })}
      >
        B
      </button>
      <button onMouseDown={(e) => toggle({ e, mark: inlineSchema.marks.em })}>
        I
      </button>
      <button
        onMouseDown={(e) => toggle({ e, mark: inlineSchema.marks.underline })}
      >
        U
      </button>
    </>
  );
};

export const SwappablePlugin = () => {
  const atoms = useAtomValue(proseAtom);
  const [plugins, setPlugin] = useAtom(atoms.plugins as PrimitiveAtom<any[]>);
  return (
    <>
      <span>{plugins.length} plugins</span>
      <button onClick={() => setPlugin([NewLinePlugin()])}>
        Enable Hotkeys Plugin
      </button>
      <button onClick={() => setPlugin([])}>Disable All Plugins</button>
      <ProseEditorScopeProvider value={proseAtom}>
        <ProseEditor />
      </ProseEditorScopeProvider>
    </>
  );
};
