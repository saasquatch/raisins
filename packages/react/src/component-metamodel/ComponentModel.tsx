import { RaisinElementNode, RaisinNodeWithChildren } from '@raisins/core';
import { NewState } from '@raisins/core/dist/util/NewState';
import { CustomElement, Slot } from '@raisins/schema/schema';
import { atom } from 'jotai';
import { NodeWithSlots } from '../model/EditorModel';
import { getSlots } from '../model/getSlots';
import { isElementNode, isRoot } from '../util/isNode';
import { moduleDetailsToBlocks } from './convert/moduleDetailsToBlocks';
import { moduleDetailsToTags } from './convert/moduleDetailsToTags';
import { modulesToDetails } from './convert/modulesToDetails';
import * as HTMLComponents from './HTMLComponents';
import { Module, ModuleDetails } from './ModuleManagement';
import { doesChildAllowParent } from './rules/doesChildAllowParent';
import { doesParentAllowChild } from './rules/doesParentAllowChild';
import { isNodeAllowed } from './rules/isNodeAllowed';

export const GlobalBlocksAtom = atom([] as Block[]);

type InternalState = {
  modules: Module[];
  loading: boolean;
  moduleDetails: ModuleDetails[];
};

const Ste = atom<InternalState>({
  loading: false,
  modules: [],
  moduleDetails: [],
});

export const ModulesAtom = atom((get) => get(Ste).modules ?? []);
export const ModuleDetailsAtom = atom((get) => get(Ste).moduleDetails ?? []);
export const ModulesLoadingAtom = atom((get) => get(Ste).loading);

export const ComponentsAtom = atom((get) => {
  const { moduleDetails } = get(Ste);
  return [
    ...Object.values(HTMLComponents),
    ...moduleDetails.reduce(moduleDetailsToTags, [] as CustomElement[]),
  ];
});

/**
 * When an NPM package is just `@local` then it is loaded from this URL
 */
export const LocalURLAtom = atom<string | undefined>(undefined);
export const BlocksAtom = atom((get) => {
  const globalBlocks = get(GlobalBlocksAtom);
  const blocksFromModules = moduleDetailsToBlocks(get(ModuleDetailsAtom));
  return [...blocksFromModules, ...globalBlocks];
});

export const AddModuleAtom = atom(null, (_, set, next: Module) =>
  set(SetModulesAtom, (modules) => [...modules, next])
);
export const RemoveModuleAtom = atom(null, (_, set, next: Module) =>
  set(SetModulesAtom, (modules) => modules.filter((e) => e !== next))
);
export const RemoveModuleByNameAtom = atom(null, (_, set, name: string) =>
  set(SetModulesAtom, (modules) => modules.filter((e) => e.name !== name))
);

/**
 * Allows modules to be edited, with their additional details provided asynchronously
 */
export const SetModulesAtom = atom(null, (get, set, m: NewState<Module[]>) => {
  set(Ste, (i) => {
    const next = typeof m === 'function' ? m(i.modules) : m;

    const localUrl = get(LocalURLAtom);
    (async () => {
      set(Ste, {
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

export const ComponentModelAtom = atom<ComponentModel>((get) => {
  const getComponentMeta = get(ComponentMetaAtom);
  const blocks: Block[] = get(BlocksAtom);
  const getValidChildren = get(ValidChildrenAtom);

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
    // Component metadata
    getComponentMeta,
    getSlots: getSlotsInternal,
    blocks,
    getValidChildren,
    isValidChild,
  };
});

/**
 * For managing the types of components that are edited and their properties
 */

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

export type ComponentModel = ComponentDetails;
