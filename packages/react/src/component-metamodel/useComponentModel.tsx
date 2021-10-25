import {
  htmlUtil,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '@raisins/core';
import { CustomElement, Slot } from '@raisins/schema/schema';
import { ElementType } from 'domelementtype';
import { atom, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useMemo } from 'react';
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

const { visit } = htmlUtil;

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
/**
 * For managing the types of components that are edited and their properties
 */
export function useComponentModel(): ComponentModel {
  const [_internalState, _setInternal] = useAtom(InternalStateAtom);
  const components: CustomElement[] = useAtomValue(ComponentsAtom);

  const [, setModules] = useAtom(SetModulesAtom);
  const addModule: (module: Module) => void = (module) =>
    setModules((modules) => [...modules, module]);
  const removeModule: (module: Module) => void = (module) =>
    setModules((modules) => modules.filter((e) => e !== module));
  const removeModuleByName: (name: string) => void = (name) =>
    setModules((modules) => modules.filter((e) => e.name !== name));

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

  const blocks: Block[] = useMemo(() => {
    const moduleDetails = _internalState.moduleDetails;
    return moduleDetailsToBlocks(moduleDetails);
  }, [_internalState.moduleDetails]);

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

  function canHaveChildren(
    node: RaisinNodeWithChildren,
    slot?: string
  ): boolean {
    return getValidChildren(node, slot).length > 0;
  }

  function getSlotsInternal(node: RaisinNodeWithChildren): NodeWithSlots {
    return getSlots(node, getComponentMeta)!;
  }

  return {
    loadingModules: _internalState.loading,
    modules: _internalState.moduleDetails,
    moduleDetails: _internalState.moduleDetails,
    addModule,
    removeModule,
    removeModuleByName,
    setModules,
    getComponentMeta,
    getSlots: getSlotsInternal,
    blocks,
    getValidChildren,
    canHaveChildren,
    isValidChild,
  };
}

export type Block = {
  title: string;
  content: RaisinElementNode;
};

export type ComponentDetails = {
  getComponentMeta: (node: RaisinElementNode) => CustomElement;
  getSlots: (node: RaisinElementNode) => NodeWithSlots;
  blocks: Block[];
  getValidChildren: (node: RaisinNodeWithChildren, slot?: string) => Block[];
  canHaveChildren: (node: RaisinNodeWithChildren, slot?: string) => boolean;
  isValidChild: (
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ) => boolean;
};

export type ComponentModel = ComponentDetails & ModuleManagement;
