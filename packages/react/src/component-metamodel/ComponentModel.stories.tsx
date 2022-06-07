import { htmlParser, RaisinElementNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { CanvasFull } from '../canvas/CanvasController.stories';
import { CanvasProvider } from '../canvas/CanvasScope';
import { ConfigMolecule, PickAndPlopMolecule } from '../core';
import {
  big,
  MintComponents,
  mintMono,
  mintTimelineNewlines,
  mintTitledSection,
} from '../examples/MintComponents';
import {
  referrerWidget,
  VanillaComponents,
} from '../examples/VanillaComponents';
import { useHotkeys } from '../hotkeys';
import { BasicStory, StoryConfigMolecule } from '../index.stories';
import { JsonPointers } from '../node/NodeChildrenEditor.stories';
import { Block, ComponentModelMolecule } from './ComponentModel';
import { Module, ModuleDetails } from './types';

const meta: Meta = {
  title: 'Component Metamodel',
  component: PackageEditorController,
  excludeStories: ['PackageEditor'],
};
export default meta;

export function PackageEditor() {
  return <PackageEditorController />;
}

const fakeBlocks: Block[] = [
  {
    title: 'div',
    content: htmlParser('<div>I am a div</div>')
      .children[0] as RaisinElementNode,
  },
  {
    title: 'tr',
    content: htmlParser(
      '<tr><td style="border: 1px solid black">test</td></tr>'
    ).children[0] as RaisinElementNode,
  },
  {
    title: 'td',
    content: htmlParser('<td style="border: 1px solid black">I am a td</td>')
      .children[0] as RaisinElementNode,
  },
  {
    title: 'table',
    content: htmlParser(
      '<table><thead></thead><tbody><tr ><td style="border: 1px solid black">1</td><td style="border: 1px solid black">2</td><td style="border: 1px solid black">3</td><tr /></tbody></table>'
    ).children[0] as RaisinElementNode,
  },
  {
    title: 'thead',
    content: htmlParser('<thead></thead>').children[0] as RaisinElementNode,
  },
  {
    title: 'tbody',
    content: htmlParser('<tbody></tbody>').children[0] as RaisinElementNode,
  },
];

const BlocksController = () => {
  const { ComponentModelAtom } = useMolecule(ComponentModelMolecule);
  const { PickedAtom } = useMolecule(PickAndPlopMolecule);

  const { blocks, groupedBlocks } = useAtomValue(ComponentModelAtom);
  const [picked, pick] = useAtom(PickedAtom);

  const pickedBlock = picked?.type === 'block' ? picked.block : undefined;
  return (
    <div
      style={{
        width: '25%',
        position: 'fixed',
        overflowY: 'scroll',
        height: '95vh',
      }}
    >
      <h2>Blocks</h2>
      {(blocks.length ? blocks : fakeBlocks).map((block) => {
        return (
          <div
            style={{
              border: '1px solid grey',
              margin: '10px',
              background: pickedBlock === block ? 'red' : 'inherit',
            }}
            onClick={() =>
              pick({
                type: 'block',
                block,
              })
            }
          >
            {block.title}
          </div>
        );
      })}
    </div>
  );
};

const Editor = () => {
  useHotkeys();
  return (
    <div style={{ display: 'flex' }}>
      <BlocksController />
      <div style={{ width: '74%', position: 'absolute', right: 0 }}>
        <CanvasProvider>
          <CanvasFull />
        </CanvasProvider>
      </div>
    </div>
  );
};

export function BigBlocks() {
  return (
    <BasicStory startingHtml={big + `<table></table>`}>
      <Editor />
    </BasicStory>
  );
}

export function MintBlocks() {
  return (
    <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
      <Editor />
    </BasicStory>
  );
}

export function MintTimelineBlocks() {
  return (
    <BasicStory
      startingHtml={mintTimelineNewlines}
      startingPackages={MintComponents}
    >
      <Editor />
    </BasicStory>
  );
}

export function MintTitledSectionBlocks() {
  return (
    <BasicStory
      startingHtml={mintTitledSection}
      startingPackages={MintComponents}
    >
      <Editor />
    </BasicStory>
  );
}

export function VanillaBlocks() {
  return (
    <BasicStory
      startingHtml={referrerWidget}
      startingPackages={VanillaComponents}
    >
      <Editor />
    </BasicStory>
  );
}

export function MintPackageEditor() {
  return (
    <BasicStory startingPackages={MintComponents}>
      <PackageEditorController />
    </BasicStory>
  );
}

export const LocalBlocks = () => {
  return (
    <BasicStory
      startingHtml={''}
      startingPackages={[
        {
          package: '@local',
          version: 'next',
        },
      ]}
    >
      <CustomThemeTest />
    </BasicStory>
  );
};

const CustomThemeTest = () => {
  // @ts-ignore
  const [html, setHtml] = useAtom(useMolecule(ConfigMolecule).HTMLAtom);

  return (
    <>
      <textarea
        value={html}
        onInput={(e) => setHtml((e.target as HTMLTextAreaElement).value)}
        rows={6}
        style={{ width: '300px' }}
      />
      <JsonPointers />

      <Editor />
    </>
  );
};

const PACKAGES = [
  '@local',
  '@saasquatch/component-boilerplate',
  '@saasquatch/mint-components',
  '@saasquatch/vanilla-components',
  '@saasquatch/bedrock-components',
  '@shoelace-style/shoelace', //@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.esm.js
];

const setOfThings: Module[] = [
  {
    package: '@shoelace-style/shoelace',
  },
  //   {
  //     package: '@shoelace-style/shoelace',
  //     filePath: 'dist/shoelace/shoelace.css',
  //   },
  {
    package: '@shoelace-style/shoelace',
    filePath: 'dist/themes/light.css',
  },
];

function usePackageEditor(): ModuleManagement {
  const {
    AddModuleAtom,
    ModuleDetailsAtom,
    ModulesAtom,
    ModulesLoadingAtom,
    RemoveModuleAtom,
    RemoveModuleByNameAtom,
  } = useMolecule(ComponentModelMolecule);
  return {
    loadingModules: useAtomValue(ModulesLoadingAtom),
    modules: useAtomValue(ModulesAtom),
    moduleDetails: useAtomValue(ModuleDetailsAtom),
    addModule: useUpdateAtom(AddModuleAtom),
    removeModule: useUpdateAtom(RemoveModuleAtom),
    removeModuleByName: useUpdateAtom(RemoveModuleByNameAtom),
  };
}

function PackageEditorController() {
  return <PackageEditorView {...usePackageEditor()} />;
}

type ModuleManagement = {
  loadingModules: boolean;
  modules: Module[];
  moduleDetails: ModuleDetails[];
  addModule(module: Module): void;
  removeModule(module: Module): void;
  removeModuleByName(name: string): void;
};

function PackageEditorView(props: ModuleManagement) {
  return (
    <div>
      <div>Loading: {props.loadingModules}</div>
      Modules:
      <ul>
        {props.modules.map((m) => (
          <li key={m.package + '@' + m.version + '/' + m.filePath}>
            {m.package} @ {m.version} for {m.filePath}
          </li>
        ))}
      </ul>
      Details:
      <ul>
        {props.moduleDetails?.map((m, i) => (
          <li key={`${m.package}@${m.version}-${i}`}>
            <b>{m['package.json'].description}</b>
            <br />
            <div style={{ fontSize: '0.8em', color: 'grey' }}>
              {m['package.json'].name} @ {m['package.json'].version}
            </div>
            <button
              onClick={() =>
                props.removeModule({
                  filePath: m.filePath,
                  package: m.package,
                  version: m.version,
                })
              }
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <h2>Add</h2>
      <button
        onClick={() => {
          setOfThings.map((m) => props.addModule(m));
        }}
      >
        Shoelace + theme
      </button>
      <button
        onClick={() => {
          [
            {
              package: '@saasquatch/mint-components',
              filePath: '/dist/mint-components/mint-components.css',
              version: '1.5.0-116',
            },
            {
              package: '@saasquatch/bedrock-components',
              filePath: '/dist/bedrock-components/bedrock-components.js',
              version: '1.3.1-7',
            },

            {
              package: '@saasquatch/mint-components',
              filePath: '/dist/mint-components/mint-components.js',
              version: '1.5.0-116',
            },
          ].forEach(props.addModule);
        }}
      >
        Mint (alpha)
      </button>
      <ul>
        {PACKAGES.map((m) => {
          return (
            <li key={m}>
              <button
                onClick={(e) => {
                  props.addModule({
                    package: m,
                  });
                }}
              >
                {m}
              </button>
            </li>
          );
        })}
      </ul>
      <h2>Remove</h2>
      <ul>
        {PACKAGES.map((m) => {
          return (
            <li key={m}>
              <button onClick={() => props.removeModuleByName(m)}>{m}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
