import { Meta } from '@storybook/react';
import { useSetAtom } from 'jotai';
import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { PickedNodeMolecule } from '../core';
import { MintComponents } from '../examples/MintComponents';
import { BasicStory } from '../index.stories';
import { ComponentModelMolecule } from './ComponentModel';
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

const BlocksController = () => {
  const { BlocksAtom } = useMolecule(ComponentModelMolecule);
  const { PickedAtom } = useMolecule(PickedNodeMolecule);
  const blocks = useAtomValue(BlocksAtom);
  const pick = useSetAtom(PickedAtom);

  return (
    <div>
      <h2>Blocks</h2>
      {blocks.map((block) => {
        return (
          <div
            style={{ borderBottom: '1px solid black' }}
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
    <BasicStory startingPackages={MintComponents}>
      <BlocksController />
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
