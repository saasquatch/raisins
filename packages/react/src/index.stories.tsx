import { RaisinElementNode, RaisinNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { Atom, atom, useAtom } from 'jotai';
import {
  createScope,
  molecule,
  ScopeProvider,
  useMolecule,
} from 'bunshi/react';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import JSONPointer from 'jsonpointer';
import React, { CSSProperties, useMemo } from 'react';
import {
  CanvasHoveredMolecule,
  CanvasPickAndPlopMolecule,
  CanvasProvider,
  CanvasScopeMolecule,
  CanvasSelectionMolecule,
} from './canvas';
import { CanvasController } from './canvas/CanvasController';
import { ComponentModelMolecule, Module } from './component-metamodel';
import { PackageEditor } from './component-metamodel/ComponentModel.stories';
import { CoreMolecule, SelectedNodeMolecule } from './core';
import { HistoryMolecule } from './core/editting/HistoryAtoms';
import { RaisinConfig, RaisinsProvider } from './core/RaisinConfigScope';
import { HoveredNodeMolecule } from './core/selection/HoveredNodeMolecule';
import {
  big,
  LocalBedrockComponents,
  MintComponents,
  mintMono,
  mintTemplates,
  NextComponents,
  templateExample,
} from './examples/MintComponents';
import {
  referrerWidget,
  VanillaComponents,
} from './examples/VanillaComponents';
import { useHotkeys } from './hotkeys/useHotkeys';
import { NodeMolecule } from './node';
import { LayersController } from './node/slots/SlotChildrenController.stories';
import { SelectedNodeRichTextEditor } from './rich-text/SelectedNodeRichTextEditor';
import { StyleEditorController } from './stylesheets/StyleEditor';
import { SnabbdomRenderer } from './canvas/util/raisinToSnabdom';
import { BasicCanvasController } from './canvas';
import { waitForUpdate } from './util/waitForUpdate';

const meta: Meta = {
  title: 'Editor',
  component: Editor,
  excludeStories: ['EditorView', 'StoryConfigMolecule', 'ErrorListController'],
};
export default meta;

const StoryScope = createScope({
  startingHtml: '<span>I am a span</span>',
  startingPackages: [] as Module[],
});

export const StoryConfigMolecule = molecule<Partial<RaisinConfig>>(
  (_, getScope) => {
    const storyScope = getScope(StoryScope);
    return {
      HTMLAtom: atom(storyScope.startingHtml),
      PackagesAtom: atom(storyScope.startingPackages),
      uiWidgetsAtom: atom({}),
      LocalURLAtom: atom('http://localhost:3000'),
    };
  }
);

const CanvasStyleMolecule = molecule((getMol, getScope) => {
  const { rerenderNodeAtom } = getMol(CoreMolecule);

  const outlineBaseAtom = atom(true);

  const OutlineAtom = atom(
    get => get(outlineBaseAtom),
    async (get, set, next: boolean) => {
      set(outlineBaseAtom, next);
      set(rerenderNodeAtom, true);
    }
  );
  const ModeAtom = atom<Mode>('edit');
  const SizeAtom = atom<Size>(sizes[0]);

  const CanvasAtoms = getMol(CanvasScopeMolecule);
  const { IsInteractibleAtom } = getMol(ComponentModelMolecule);

  const Renderer: Atom<SnabbdomRenderer> = atom(get => {
    const isInteractible = get(IsInteractibleAtom);
    const outlined = get(OutlineAtom);

    const renderer: SnabbdomRenderer = (d, n) => {
      if (!isInteractible(n)) return { ...d, outline: '', outlineOffset: '' };

      const { delayed, remove, ...rest } = d.style || {};

      const style = {
        ...rest,
        outline: outlined ? '1px dashed #999' : '',
        outlineOffset: outlined ? '-2px' : '',
      };
      return {
        ...d,
        style,
      };
    };
    return renderer;
  });
  CanvasAtoms.RendererSet.add(Renderer);

  return {
    OutlineAtom,
    ModeAtom,
    SizeAtom,
  };
});

const ErrorListMolecule = molecule(getMol => {
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { errorsAtom } = getMol(NodeMolecule);

  const ErrorDetails = atom(get => {
    const errors = get(errorsAtom);
    const root = get(RootNodeAtom);

    return errors.map(e => {
      return {
        error: e,
        node: JSONPointer.get(root, e.jsonPointer) as RaisinNode,
      };
    });
  });
  return { ErrorDetails };
});

export function ErrorListController() {
  const { ErrorDetails } = useMolecule(ErrorListMolecule);
  const errors = useAtomValue(ErrorDetails);
  return (
    <div style={{ color: 'red' }}>
      Errors
      <hr />
      <details style={{ maxHeight: '300px', overflow: 'scroll' }}>
        <summary>{errors.length} errors</summary>
        {errors.map(e => {
          const error = e.error.error;

          if (error.type === 'ancestry') {
            return (
              <li>
                {error.rule === 'doesParentAllowChild' && (
                  <span>
                    {error.parentMeta?.title ??
                      (error.parent as RaisinElementNode).type}{' '}
                    does not allow{' '}
                    {error.childMeta?.title ??
                      (error.child as RaisinElementNode).tagName}{' '}
                    inside it. Valid children are:{' '}
                    {error.parentMeta?.slots
                      ?.map(s => s.validChildren)
                      .join(',')}
                  </span>
                )}
                {error.rule === 'doesChildAllowParent' && (
                  <span>
                    {error.childMeta?.title ?? error.child.type} is not allowed
                    inside of {error.parentMeta?.title ?? error.parent.type}.
                    Valid parents are:{' '}
                    {error.childMeta?.validParents?.join(',')}
                  </span>
                )}
              </li>
            );
          } else {
            return (
              <li>
                {error.attribute.name} is invalid. {error.rule}
              </li>
            );
          }
        })}
      </details>
    </div>
  );
}

export function BasicStory({
  startingHtml = '<span>I am a span</span>',
  startingPackages = [] as Module[],
  children = (
    <>
      <Editor />
      {/* <RegisteredAtoms /> */}
    </>
  ),
  Molecule = StoryConfigMolecule,
}) {
  return (
    <>
      <CanvasProvider>
        <ScopeProvider
          scope={StoryScope}
          value={{ startingHtml, startingPackages }}
        >
          <RaisinsProvider molecule={Molecule}>{children}</RaisinsProvider>
        </ScopeProvider>{' '}
      </CanvasProvider>
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
      <CanvasProvider>
        <textarea
          value={html}
          onInput={e => setHtml((e.target as HTMLTextAreaElement).value)}
        />
        <RaisinsProvider molecule={state}>
          <Editor />

          {/* <RegisteredAtoms /> */}
        </RaisinsProvider>
      </CanvasProvider>
    </>
  );
}

export const Mint = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents} />
);
export const Vanilla = () => (
  <BasicStory
    startingHtml={referrerWidget}
    startingPackages={VanillaComponents}
  />
);
export const Big = () => <BasicStory startingHtml={big} />;

export const Templates = () => {
  return (
    <BasicStory
      startingHtml={mintTemplates}
      startingPackages={NextComponents}
    />
  );
};

export const TemplatesLocal = () => {
  return (
    <BasicStory
      startingHtml={mintTemplates}
      startingPackages={LocalBedrockComponents}
    />
  );
};

export const TemplatesExample = () => (
  <BasicStory
    startingHtml={templateExample}
    startingPackages={NextComponents}
  />
);

const ToolbarMolecule = molecule(getMol => {
  return {
    ...getMol(HoveredNodeMolecule),
    ...getMol(SelectedNodeMolecule),
    ...getMol(HistoryMolecule),
    ...getMol(CanvasStyleMolecule),
    ...getMol(CanvasSelectionMolecule),
    ...getMol(CanvasHoveredMolecule),
    ...getMol(ComponentModelMolecule),
    ...getMol(CanvasPickAndPlopMolecule),
  };
});

function Editor() {
  useHotkeys();
  useMolecule(CanvasStyleMolecule);
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
          <ErrorListController />
          <ToolbarController />
        </div>

        <div style={LayersCss}>
          <LayersController />
        </div>

        <div style={CanvasCss}>
          <BasicCanvasController />
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

export type Size = {
  name: string;
  width: string;
  height: number;
};

type Mode = 'preview' | 'edit';

const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

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
      {sizes.map(s => (
        <button onClick={() => setSize(s)} disabled={size === s} key={s.name}>
          {s.name}
        </button>
      ))}
      <button
        onClick={() => setOutlined(o => !o)}
        style={{ cursor: 'initial' } as CSSProperties & CSSStyleDeclaration}
      >
        {outlined ? 'Outlined' : 'No Outline'}
      </button>
      Hovered: {hovered}
    </div>
  );
}
