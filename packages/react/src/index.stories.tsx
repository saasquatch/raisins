import { Meta } from '@storybook/react';
import { atom, useAtom } from 'jotai';
import {
  createScope,
  molecule,
  ScopeProvider,
  useMolecule,
} from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React, { CSSProperties, useMemo } from 'react';
import { CanvasController } from './canvas/CanvasController';
import { CanvasStyleMolecule, sizes } from './canvas/CanvasStyleMolecule';
import { PackageEditor } from './component-metamodel/ComponentModel.stories';
import { HistoryMolecule } from './core/editting/HistoryAtoms';
import { RaisinConfig, RaisinsProvider } from './core/RaisinPropsScope';
import { HoveredNodeMolecule } from './core/selection/HoveredNode';
import { big, MintComponents, mintMono } from './examples/MintComponents';
import { useHotkeys } from './hotkeys/useHotkeys';
import { LayersController } from './node/slots/SlotChildrenController.stories';
import { SelectedNodeRichTextEditor } from './rich-text/SelectedNodeRichTextEditor';
import { StyleEditorController } from './stylesheets/StyleEditor';
import { Module } from './util/NPMRegistry';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
  excludeStories: ['EditorView'],
};
export default meta;

const StoryScope = createScope({
  startingHtml: '<span>I am a span</span>',
  startingPackages: [] as Module[],
});

const StoryMolecule = molecule<Partial<RaisinConfig>>((_, getScope) => {
  const storyScope = getScope(StoryScope);
  return {
    HTMLAtom: atom(storyScope.startingHtml),
    PackagesAtom: atom(storyScope.startingPackages),
    uiWidgetsAtom: atom({}),
  };
});

export function BasicStory({
  startingHtml = '<span>I am a span</span>',
  startingPackages = [] as Module[],
  children = (
    <>
      <Editor />
      {/* <RegisteredAtoms /> */}
    </>
  ),
}) {
  return (
    <>
      <ScopeProvider
        scope={StoryScope}
        value={{ startingHtml, startingPackages }}
      >
        <RaisinsProvider molecule={StoryMolecule}>{children}</RaisinsProvider>
      </ScopeProvider>{' '}
    </>
  );
}

export function ExternalHTMLControl() {
  const state = useMemo(
    () =>
      molecule(() => {
        return {
          HTMLAtom: atom(
            '<div><my-thing><span slot="default">I am a span</span></my-thing></div>'
          ),
          PackagesAtom: atom([] as Module[]),
          uiWidgetsAtom: atom({}),
        };
      }),
    []
  );

  const [html, setHtml] = useAtom(useMolecule(state).HTMLAtom);
  return (
    <>
      <textarea
        value={html}
        onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
      />
      <RaisinsProvider molecule={state}>
        <Editor />
        {/* <RegisteredAtoms /> */}
      </RaisinsProvider>
    </>
  );
}

export const Mint = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents} />
);
export const Big = () => <BasicStory startingHtml={big} />;

function Editor() {
  useHotkeys();

  return <EditorView />;
}

Editor.args = {
  /**
   * Used for serving local packages
   */
  domain: 'https://localhost:5000',
};

const Row: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  width: '100%',
};

const Header: CSSProperties = {
  gridArea: 'header',
};
const Edits: CSSProperties = {
  gridArea: 'edits',
};
const CanvasCss: CSSProperties = {
  gridArea: 'canvas',
  overflow: 'scroll',
};
const LayersCss: CSSProperties = {
  gridArea: 'layers',
  overflowY: 'scroll',
};

const Main: CSSProperties = {
  display: 'grid',
  gridGap: '1em',
  gridTemplateAreas: `
    'header header header'
    'layers canvas edits'
    'footer footer footer'`,
  gridTemplateRows: 'auto 1fr auto',
  gridTemplateColumns: '20% 1fr 15%',
  gridRowGap: '10px',
  gridColumnGap: '10px',
  height: '100vh',
  margin: '0',

  overflowY: 'hidden',
};

export function EditorView() {
  return (
    <>
      <div style={Main}>
        <div style={Header}>
          <ToolbarController />
        </div>

        <div style={LayersCss}>
          <LayersController />
        </div>

        <div style={CanvasCss}>
          <CanvasController />
          <CanvasController />
          <SelectedNodeRichTextEditor />
        </div>

        <div style={Edits}>
          <PackageEditor />
          <StyleEditorController />
        </div>
      </div>
    </>
  );
}

const ToolbarMolecule = molecule((getMol) => {
  return {
    ...getMol(HoveredNodeMolecule),
    ...getMol(HistoryMolecule),
    ...getMol(CanvasStyleMolecule),
  };
});

function ToolbarController() {
  const atoms = useMolecule(ToolbarMolecule);
  const historySize = useAtom(atoms.HistorySizeAtom)[0];
  const undo = useUpdateAtom(atoms.UndoAtom);
  const redo = useUpdateAtom(atoms.RedoAtom);
  const [mode, setMode] = useAtom(atoms.ModeAtom);
  const [size, setSize] = useAtom(atoms.SizeAtom);
  const [outlined, setOutlined] = useAtom(atoms.OutlineAtom);

  const hovered = useAtomValue(atoms.HoveredBreadcrumbsAtom);

  return (
    <div>
      Toolbar
      <button onClick={undo} disabled={historySize.undoSize <= 0}>
        Undo ({historySize.undoSize})
      </button>
      <button onClick={redo} disabled={historySize.redoSize <= 0}>
        Redo ({historySize.redoSize})
      </button>
      {mode}
      <button disabled={mode === 'edit'} onClick={() => setMode('edit')}>
        Edit
      </button>
      <button disabled={mode === 'preview'} onClick={() => setMode('preview')}>
        Preview
      </button>
      <button
        disabled
        style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
      >
        Screen
      </button>
      {sizes.map((s) => (
        <button onClick={() => setSize(s)} disabled={size === s} key={s.name}>
          {s.name}
        </button>
      ))}
      <button
        onClick={() => setOutlined((o) => !o)}
        style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
      >
        {outlined ? 'Outlined' : 'No Outline'}
      </button>
      Hovered: {hovered}
    </div>
  );
}
