import { htmlParser, type RaisinElementNode } from '@raisins/core';
import { type Meta } from '@storybook/react';
import { useMolecule } from 'bunshi/react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React from 'react';
import {
  AttributeProvider,
  type AttributesControllerProps,
  AttributesMolecule,
} from '../attributes/index.ts';
import { CanvasFull } from '../canvas/CanvasController.stories.tsx';
import { CanvasProvider } from '../canvas/CanvasScope.tsx';
import {
  ConfigMolecule,
  PickAndPlopMolecule,
  SelectedNodeController,
} from '../core/index.ts';
import {
  AttributeEditorView,
  DefaultAttributeComponentView,
} from '../core/selection/SelectedNodeController.stories.tsx';
import {
  big,
  MintComponents,
  mintMono,
  mintTimelineNewlines,
  mintTitledSection,
} from '../examples/MintComponents.tsx';
import {
  referrerWidget,
  VanillaComponents,
} from '../examples/VanillaComponents.tsx';
import { useHotkeys } from '../hotkeys/index.ts';
import { BasicStory } from '../index.stories.tsx';
import { JsonPointersView } from '../node/NodeChildrenEditor.stories.tsx';
import { type Block, ComponentModelMolecule } from './ComponentModel.tsx';
import { type Module, type ModuleDetails } from './types.ts';

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
        overflowY: 'auto',
        padding: '12px',
      }}
    >
      <h3 style={{ margin: '0 0 8px' }}>Blocks</h3>
      {(blocks.length ? blocks : fakeBlocks).map(block => {
        return (
          <div
            key={block.title}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              padding: '8px 12px',
              marginBottom: '6px',
              cursor: 'pointer',
              background: pickedBlock === block ? '#bbdefb' : '#fff',
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

const CustomAttributesControllerView: React.FC<AttributesControllerProps> = props => {
  const { keysAtom, groupedSchemaAtom } = useMolecule(AttributesMolecule);
  const keys = useAtomValue(keysAtom);
  const groupedSchema = useAtomValue(groupedSchemaAtom);

  if (!keys) return <></>;
  const Component = props.Component ?? DefaultAttributeComponentView;
  return (
    <>
      {Object.keys(groupedSchema).map((key, idx) => {
        return (
          <>
            {groupedSchema[key].map(attribute => {
              return (
                <AttributeProvider
                  attributeName={attribute.name}
                  key={attribute.name}
                >
                  <Component />
                </AttributeProvider>
              );
            })}
            <hr />
          </>
        );
      })}
    </>
  );
};

const EditorWithProps = () => {
  return (
    <CanvasProvider>
      <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '13px' }}>
        <div style={{ flex: '0 0 260px', borderRight: '1px solid #e0e0e0', overflowY: 'auto', padding: '12px' }}>
          <details open>
            <summary>Blocks</summary>
            <BlocksController />
          </details>

          <AttributeEditorView
            Controller={() => (
              <SelectedNodeController
                HasSelectionComponent={CustomAttributesControllerView}
              ></SelectedNodeController>
            )}
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <CanvasFull />
        </div>
      </div>
    </CanvasProvider>
  );
};

export const CustomAttributesController = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
    <EditorWithProps />
  </BasicStory>
);

const Editor = () => {
  useHotkeys();
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '13px' }}>
      <div style={{ flex: '0 0 260px', borderRight: '1px solid #e0e0e0', overflowY: 'auto' }}>
        <BlocksController />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
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

export const LocalBlocksAndProps = () => {
  return (
    <BasicStory
      startingHtml={`
      <sqm-portal-container direction="column" gap="xxx-large">
  <sqm-portal-profile></sqm-portal-profile> </sqm-portal-container
><sqm-portal-container direction="column" gap="xxx-large">
  <sqm-portal-change-password></sqm-portal-change-password>
</sqm-portal-container>

      `}
      startingPackages={[
        {
          package: '@local',
          version: 'next',
        },
      ]}
    >
      <CustomThemeTestWithProps />
    </BasicStory>
  );
};

const CustomThemeTestWithProps = () => {
  return (
    <>
      <JsonPointersView />
      <EditorWithProps />
    </>
  );
};

const CustomThemeTest = () => {
  // @ts-ignore
  const [html, setHtml] = useAtom(useMolecule(ConfigMolecule).HTMLAtom);

  return (
    <>
      <textarea
        value={html}
        onInput={e => setHtml((e.target as HTMLTextAreaElement).value)}
        rows={6}
        style={{ width: '300px' }}
      />
      <JsonPointersView />

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
    addModule: useSetAtom(AddModuleAtom),
    removeModule: useSetAtom(RemoveModuleAtom),
    removeModuleByName: useSetAtom(RemoveModuleByNameAtom),
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
        {props.modules.map(m => (
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
          setOfThings.map(m => props.addModule(m));
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
        {PACKAGES.map(m => {
          return (
            <li key={m}>
              <button
                onClick={e => {
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
        {PACKAGES.map(m => {
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
