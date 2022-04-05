import { useMolecule } from 'jotai-molecules';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import { ComponentModelMolecule } from '../component-metamodel/ComponentModel';
import { Module, ModuleDetails } from '../component-metamodel/ModuleManagement';
import { RaisinScope } from '../core/RaisinScope';

export const PACKAGES = [
  '@local',
  '@saasquatch/component-boilerplate',
  '@saasquatch/mint-components',
  '@saasquatch/vanilla-components',
  '@saasquatch/bedrock-components',
  '@shoelace-style/shoelace', //@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.esm.js
];
// const scripts = [
//   `
// <link rel="stylesheet" href="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.css" />
// <link rel="stylesheet" href="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.27/themes/dark.css" />
// <script type="module" src="https://fast.ssqt.io/npm/@shoelace-style/shoelace@2.0.0-beta.25/dist/shoelace/shoelace.esm.js"></script>
// <style>body{margin:0;}</style>
// <!-- TODO: Script management -->
// <script type="text/javascript" src="https://fast.ssqt.io/npm/@saasquatch/vanilla-components@1.0.x/dist/widget-components.js"></script>
// <link href="https://fast.ssqt.io/npm/@saasquatch/vanilla-components-assets@0.0.x/icons.css" type="text/css" rel="stylesheet" />`,
// ];

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
    loadingModules: useAtomValue(ModulesLoadingAtom, RaisinScope),
    modules: useAtomValue(ModulesAtom, RaisinScope),
    moduleDetails: useAtomValue(ModuleDetailsAtom, RaisinScope),
    addModule: useUpdateAtom(AddModuleAtom, RaisinScope),
    removeModule: useUpdateAtom(RemoveModuleAtom, RaisinScope),
    removeModuleByName: useUpdateAtom(RemoveModuleByNameAtom, RaisinScope),
  };
}

export function PackageEditorController() {
  return <PackageEditorView {...usePackageEditor()} />;
}

export type ModuleManagement = {
  loadingModules: boolean;
  modules: Module[];
  moduleDetails: ModuleDetails[];
  addModule(module: Module): void;
  removeModule(module: Module): void;
  removeModuleByName(name: string): void;
};

export function PackageEditorView(props: ModuleManagement) {
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
