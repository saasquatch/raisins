import {
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '@raisins/core';
import { CustomElement, Slot } from '@raisins/schema/schema';
import { ElementType } from 'domelementtype';
import { atom, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { NewState } from '../../../core/dist/util/NewState';
import * as HTMLComponents from '../component-metamodel/HTMLComponents';
import { NodeWithSlots } from '../model/EditorModel';
import { getSlots } from '../model/getSlots';
import { isElementNode, isRoot } from '../views/isNode';
import { moduleDetailsToBlocks } from './convert/moduleDetailsToBlocks';
import { moduleDetailsToTags } from './convert/moduleDetailsToTags';
import { modulesToDetails } from './convert/modulesToDetails';
import { Module, ModuleDetails, ModuleManagement } from './ModuleManagement';
import { doesChildAllowParent } from './rules/doesChildAllowParent';
import { doesParentAllowChild } from './rules/doesParentAllowChild';
import { isNodeAllowed } from './rules/isNodeAllowed';

export const DEFAULT_BLOCKS: Block[] = [
  {
    title: 'Some Div',
    content: {
      type: ElementType.Tag,
      tagName: 'div',
      attribs: {},
      children: [
        { type: ElementType.Text, data: 'I am a div' } as RaisinTextNode,
      ],
    },
  },
];

type InternalState = {
  modules: Module[];
  loading: boolean;
  moduleDetails: ModuleDetails[];
};

const InternalStateAtom = atom<InternalState>({
  loading: false,
  modules: [],
  moduleDetails: [],
});

export const ModuleDetailsAtom = atom(
  (get) => get(InternalStateAtom).moduleDetails
);

export const ComponentsAtom = atom((get) => {
  const { moduleDetails } = get(InternalStateAtom);
  return [
    ...Object.values(HTMLComponents),
    ...moduleDetails.reduce(moduleDetailsToTags, [] as CustomElement[]),
  ];
});

/**
 * When an NPM package is just `@local` then it is loaded from this URL
 */
export const LocalURLAtom = atom<string | undefined>(undefined);
export const BlocksAtom = atom((get) =>
  moduleDetailsToBlocks(get(ModuleDetailsAtom))
);

/**
 * Allows modules to be edited, with their additional details provided asynchronously
 */
const SetModulesAtom = atom(null, (get, set, m: NewState<Module[]>) => {
  set(InternalStateAtom, (i) => {
    const next = typeof m === 'function' ? m(i.modules) : m;

    const localUrl = get(LocalURLAtom);
    (async () => {
      set(InternalStateAtom, {
        loading: false,
        modules: next,
        moduleDetails: await modulesToDetails(next, localUrl),
      });
    })();

    return {
      modules: next,
      loading: true,
      moduleDetails: i.moduleDetails,
    };
  });
});

const ComponentMetaAtom = atom<ComponentMetaProvider>((get) => {
  const components = get(ComponentsAtom);
  function getComponentMeta(node: RaisinElementNode): CustomElement {
    const found = components.find((c) => c.tagName === node.tagName);
    if (found) return found;

    return {
      tagName: node.tagName,
      title: node.tagName,
      // Default slot meta assumes no children. We may want to assume a permissive default slot.
      slots: [],
    };
  }
  return getComponentMeta;
});

export const ValidChildrenAtom = atom((get) => {
  const blocks = get(BlocksAtom);
  const getComponentMeta = get(ComponentMetaAtom);

  function getValidChildren(
    node: RaisinNodeWithChildren,
    slot?: string
  ): Block[] {
    const allowedInParent = blocks.filter((block) => {
      const childMeta = getComponentMeta(block.content);
      const childAllowsParents = doesChildAllowParent(childMeta, node);
      return childAllowsParents;
    });

    if (isRoot(node)) {
      return allowedInParent;
    }
    if (!isElementNode(node)) {
      // Only Root and Element nodes allow children
      return [];
    }
    const nodeMeta = getComponentMeta(node);
    const slotMeta = nodeMeta?.slots?.find((s: Slot) => s.name === slot);

    if (!slotMeta) {
      // No meta for slot, so we assume anything is allowed
      return allowedInParent;
    }

    const filter = (block: Block) =>
      doesParentAllowChild(block.content, nodeMeta, slot);
    const validChildren = blocks.filter(filter);
    if (!validChildren.length) {
      return [];
    }
    return validChildren;
  }

  return getValidChildren;
});

/**
 * For managing the types of components that are edited and their properties
 */
export function useComponentModel(): ComponentModel {
  const [_internalState, _setInternal] = useAtom(InternalStateAtom);

  const [, setModules] = useAtom(SetModulesAtom);
  const addModule: (module: Module) => void = (module) =>
    setModules((modules) => [...modules, module]);
  const removeModule: (module: Module) => void = (module) =>
    setModules((modules) => modules.filter((e) => e !== module));
  const removeModuleByName: (name: string) => void = (name) =>
    setModules((modules) => modules.filter((e) => e.name !== name));

  const getComponentMeta = useAtomValue(ComponentMetaAtom);
  const blocks: Block[] = useAtomValue(BlocksAtom);
  const getValidChildren = useAtomValue(ValidChildrenAtom);

  function isValidChild(
    child: RaisinElementNode,
    parent: RaisinElementNode,
    slot: string
  ): boolean {
    if (child === parent) {
      // Can't drop into yourself
      return false;
    }
    const parentMeta = getComponentMeta(parent);
    const childMeta = getComponentMeta(child);
    return isNodeAllowed(child, childMeta, parent, parentMeta, slot);
  }

  function getSlotsInternal(node: RaisinNodeWithChildren): NodeWithSlots {
    return getSlots(node, getComponentMeta)!;
  }

  return {
    // Module management
    loadingModules: _internalState.loading,
    modules: _internalState.moduleDetails,
    moduleDetails: _internalState.moduleDetails,
    addModule,
    removeModule,
    removeModuleByName,
    setModules,

    // Component metadata
    getComponentMeta,
    getSlots: getSlotsInternal,
    blocks,
    getValidChildren,
    isValidChild,
  };
}

export type Block = {
  title: string;
  content: RaisinElementNode;
};

export type ComponentDetails = {
  getComponentMeta: ComponentMetaProvider;
  getSlots: (node: RaisinElementNode) => NodeWithSlots;
  blocks: Block[];
  getValidChildren: (node: RaisinNodeWithChildren, slot?: string) => Block[];
  isValidChild: (
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ) => boolean;
};

export type ComponentMetaProvider = (node: RaisinElementNode) => CustomElement;

export type ComponentModel = ComponentDetails & ModuleManagement;
