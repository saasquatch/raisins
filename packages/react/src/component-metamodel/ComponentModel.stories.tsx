import { htmlParser, RaisinElementNode } from '@raisins/core';
import { Meta } from '@storybook/react';
import { useSetAtom, useAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { CanvasProvider } from '../canvas';
import { CanvasFull } from '../canvas/CanvasController.stories';
import { PickedNodeMolecule } from '../core';
import { big, MintComponents } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
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
    content: htmlParser('<div>I am div</div>').children[0] as RaisinElementNode,
  },
];

const BlocksController = () => {
  const { BlocksAtom } = useMolecule(ComponentModelMolecule);
  const { PickedAtom } = useMolecule(PickedNodeMolecule);
  const blocks = fakeBlocks ?? useAtomValue(BlocksAtom);
  const [picked, pick] = useAtom(PickedAtom);

  const pickedBlock = picked?.type === "block" ? picked.block : undefined
  return (
    <div>
      <h2>Blocks</h2>
      {blocks.map((block) => {
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

export function MintBlocks() {
  return (
    <BasicStory startingHtml={big} startingPackages={MintComponents}>
      <>
        <BlocksController />
        <CanvasProvider>
          <CanvasFull />
        </CanvasProvider>
      </>
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
    name: '@shoelace-style/shoelace',
  },
  //   {
  //     name: '@shoelace-style/shoelace',
  //     filePath: 'dist/shoelace/shoelace.css',
  //   },
  {
    name: '@shoelace-style/shoelace',
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
          <li key={m.name + '@' + m.version + '/' + m.filePath}>
            {m.name} @ {m.version} for {m.filePath}
          </li>
        ))}
      </ul>
      Details:
      <ul>
        {props.moduleDetails?.map((m) => (
          <li key={`${m.name}@${m.version}`}>
            <b>{m['package.json'].description}</b>
            <br />
            <div style={{ fontSize: '0.8em', color: 'grey' }}>
              {m['package.json'].name} @ {m['package.json'].version}
            </div>
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
              name: '@saasquatch/mint-components',
              filePath: '/dist/mint-components/mint-components.css',
              version: '1.5.0-116',
            },
            {
              name: '@saasquatch/bedrock-components',
              filePath: '/dist/bedrock-components/bedrock-components.js',
              version: '1.3.1-7',
            },

            {
              name: '@saasquatch/mint-components',
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
                    name: m,
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
