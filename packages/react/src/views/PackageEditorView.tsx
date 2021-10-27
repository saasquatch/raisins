import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import React from 'react';
import {
  AddModuleAtom,
  ModuleDetailsAtom,
  ModulesAtom,
  ModulesLoadingAtom,
  RemoveModuleAtom,
  RemoveModuleByNameAtom,
} from '../component-metamodel/ComponentModel';
import { Module, ModuleDetails } from '../component-metamodel/ModuleManagement';

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
  return {
    loadingModules: useAtomValue(ModulesLoadingAtom),
    modules: useAtomValue(ModulesAtom),
    moduleDetails: useAtomValue(ModuleDetailsAtom),
    addModule: useUpdateAtom(AddModuleAtom),
    removeModule: useUpdateAtom(RemoveModuleAtom),
    removeModuleByName: useUpdateAtom(RemoveModuleByNameAtom),
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
          <li>
            {m.name} @ {m.version} for {m.filePath}
          </li>
        ))}
      </ul>
      Details:
      <ul>
        {props.moduleDetails?.map((m) => (
          <li>
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
      <ul>
        {PACKAGES.map((m) => {
          return (
            <li>
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
            <li>
              <button onClick={() => props.removeModuleByName(m)}>{m}</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
