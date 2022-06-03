import { htmlParser } from '@raisins/core';
import { atom, PrimitiveAtom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { SelectionBookmark } from 'prosemirror-state';
import React from 'react';
import { DefaultProseSchema } from './default-schema/DefaultProseSchema';
import { DefaultProseSchemaHotkeysPlugin } from './default-schema/DefaultProseSchemaHotkeysPlugin';
import { DefaultProseSchemaMarkMolecule } from './default-schema/DefaultProseSchemaMarkMolecule';
import { ProseEditor } from './ProseEditor';
import {
  ProseEditorScopeProps,
  ProseEditorScopeProvider,
  ProseEditorScopeType,
} from './ProseEditorScope';

export default { title: 'Prose Editor' };

const proseAtom: ProseEditorScopeType = atom(() => {
  const props: ProseEditorScopeProps = {
    node: atom(
      htmlParser(
        `A bunch of text nodes with <b>inline content</b> and <a href="example">links</a> and without href <a>test</a>`
      )
    ),
    plugins: atom([DefaultProseSchemaHotkeysPlugin]),
    schema: atom(DefaultProseSchema),
    selection: atom(undefined as SelectionBookmark | undefined),
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
      Scenario: Mark detection is active (TODO)
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
      Scenario: StoredMarks work (TODO)
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
  const ToggleMarks = useMolecule(DefaultProseSchemaMarkMolecule);
  const [isBold, toggleBold] = useAtom(ToggleMarks.toggleStrong);
  const [isItalic, toggleItalic] = useAtom(ToggleMarks.toggleI);
  const [isUnderline, toggleUnderline] = useAtom(ToggleMarks.toggleU);
  const toggleLink = useSetAtom(ToggleMarks.toggleLink);

  return (
    <>
      <button
        onMouseDown={toggleBold}
        style={{ background: isBold ? 'grey' : undefined }}
      >
        B
      </button>
      <button
        onMouseDown={toggleItalic}
        style={{ background: isItalic ? 'grey' : undefined }}
      >
        I
      </button>
      <button
        onMouseDown={toggleUnderline}
        style={{ background: isUnderline ? 'grey' : undefined }}
      >
        U
      </button>
      <button onMouseDown={toggleLink}>🔗</button>
    </>
  );
};

export const SwappablePlugin = () => {
  const atoms = useAtomValue(proseAtom);
  const [plugins, setPlugin] = useAtom(atoms.plugins as PrimitiveAtom<any[]>);
  return (
    <>
      <span>{plugins.length} plugins</span>
      <button onClick={() => setPlugin([DefaultProseSchemaHotkeysPlugin])}>
        Enable Hotkeys Plugin
      </button>
      <button onClick={() => setPlugin([])}>Disable All Plugins</button>
      <ProseEditorScopeProvider value={proseAtom}>
        <ProseEditor />
      </ProseEditorScopeProvider>
    </>
  );
};
