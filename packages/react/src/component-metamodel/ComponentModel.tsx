import {
  doesChildAllowParent,
  doesParentAllowChild,
  getSlots,
  HTMLComponents,
  isNodeAllowed,
  NodeWithSlots,
  RaisinElementNode,
  RaisinNode,
  DefaultTextMarks,
} from '@raisins/core';
import { CustomElement, Slot } from '@raisins/schema/schema';
import { Atom, atom, PrimitiveAtom, WritableAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { loadable } from 'jotai/utils';
import { ConfigMolecule } from '../core';
import { CoreMolecule } from '../core/CoreAtoms';
import { isElementNode, isRoot } from '../util/isNode';
import {
  NPMRegistry,
  NPMRegistryAtom as RegistryAtom,
} from '../util/NPMRegistry';
import shallowEqual from '../util/shallowEqual';
import { moduleDetailsToBlocks } from './convert/moduleDetailsToBlocks';
import { moduleDetailsToTags } from './convert/moduleDetailsToTags';
import { modulesToDetails } from './convert/modulesToDetails';
import { Loadable, Module, ModuleDetails } from './types';

export type ComponentModelMoleculeType = {
  ModulesAtom: PrimitiveAtom<Module[]>;
  ModuleDetailsAtom: Atom<ModuleDetails[]>;
  ModuleDetailsStateAtom: Atom<Loadable<Promise<ModuleDetails[]>>>;
  ModulesLoadingAtom: Atom<boolean>;
  ComponentsAtom: Atom<CustomElement[]>;
  LocalURLAtom: Atom<string | undefined>;
  BlocksAtom: Atom<Block[]>;
  AddModuleAtom: WritableAtom<null, Module>;
  RemoveModuleAtom: WritableAtom<null, Module>;
  RemoveModuleByNameAtom: WritableAtom<null, string>;
  ComponentMetaAtom: Atom<ComponentMetaProvider>;
  ValidChildrenAtom: Atom<
    (node: RaisinNode, slot?: string | undefined) => Block[]
  >;
  ComponentModelAtom: Atom<ComponentModel>;
  IsInteractibleAtom: Atom<InteractibleProvider>;
  NonInteractibleTags: Set<string>;
  NPMRegistryAtom: Atom<NPMRegistry>;
};

export const ComponentModelMolecule = molecule(
  (getMol): ComponentModelMoleculeType => {
    const { ParentsAtom } = getMol(CoreMolecule);
    const { PackagesAtom, LocalURLAtom } = getMol(ConfigMolecule);

    /**
     * Module details from NPM (loaded async)
     */
    const ModuleDetailsAync = atom(
      async (get) =>
        await modulesToDetails(get(PackagesAtom), get(LocalURLAtom))
    );
    /**
     * Module details from NPM (or loading or error)
     */
    const ModuleDetailsStateAtom = loadable(ModuleDetailsAync);

    /**
     * List of modules from NPM
     */
    const ModuleDetailsAtom = atom((get) => {
      const state = get(ModuleDetailsStateAtom);
      if (state.state === 'hasData') return state.data;
      return [];
    });

    /**
     * `true` while module information is being loaded from NPM
     */
    const ModulesLoadingAtom = atom(
      (get) => get(ModuleDetailsStateAtom).state === 'loading'
    );

    /**
     * The array of {@link CustomElement} from ALL packages
     */
    const ComponentsAtom = atom((get) => {
      const moduleDetails = get(ModuleDetailsAtom);
      return [
        ...Object.values(HTMLComponents),
        ...moduleDetails.reduce(moduleDetailsToTags, [] as CustomElement[]),
      ];
    });

    /**
     * The array of {@link Block} from ALL packages
     */
    const BlocksAtom = atom((get) => {
      const blocksFromModules = moduleDetailsToBlocks(get(ModuleDetailsAtom));
      const defaultBlocks = DEFAULT_BLOCKS.map((block) => ({
        title: block.title,
        content: { ...block },
      })) as Block[];

      return [...blocksFromModules, ...defaultBlocks];
    });
    BlocksAtom.debugLabel = 'BlocksAtom';

    /**
     * Add another NPM package
     */
    const AddModuleAtom = atom(null, (_, set, next: Module) =>
      set(PackagesAtom, (modules) => [...modules, next])
    );
    AddModuleAtom.debugLabel = 'AddModuleAtom';

    /**
     * Remove an NPM package
     */
    const RemoveModuleAtom = atom(null, (_, set, next: Module) =>
      set(PackagesAtom, (modules) =>
        modules.filter((e) => {
          return !shallowEqual(e, next);
        })
      )
    );
    RemoveModuleAtom.debugLabel = 'RemoveModuleAtom';

    /**
     * Remove all packages based on their NPM name
     */
    const RemoveModuleByNameAtom = atom(null, (_, set, name: string) =>
      set(PackagesAtom, (modules) => modules.filter((e) => e.package !== name))
    );
    RemoveModuleByNameAtom.debugLabel = 'RemoveModuleByNameAtom';

    /**
     * A function used to find components details
     */
    const ComponentMetaAtom = atom<ComponentMetaProvider>((get) => {
      const components = get(ComponentsAtom);
      function getComponentMeta(tagName: string): CustomElement {
        const found = components.find((c) => c.tagName === tagName);
        if (found) return found;

        return {
          tagName: tagName,
          title: tagName,
          // Default slot meta assumes no children. We may want to assume a permissive default slot.
          slots: [],
        };
      }
      return getComponentMeta;
    });
    ComponentMetaAtom.debugLabel = 'ComponentMetaAtom';

    /**
     * A function to get a list of possible children for a node/slot combo
     */
    const ValidChildrenAtom = atom((get) => {
      const blocks = get(BlocksAtom);
      const getComponentMeta = get(ComponentMetaAtom);

      function getValidChildren(node: RaisinNode, slot?: string): Block[] {
        // Non-documents and elements aren't allowed children
        if (!isElementNode(node) || !isRoot(node)) return [];

        const allowedInParent = blocks.filter((block) => {
          const childMeta = getComponentMeta(block.content.tagName);
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
    ValidChildrenAtom.debugLabel = 'ValidChildrenAtom';

    /**
     * Returns the {@link ComponentModel}
     *
     * A mixed bag of functions used to grab data from the NPM package details
     * and enforce validation
     */
    const ComponentModelAtom = atom<ComponentModel>((get) => {
      const getComponentMeta = get(ComponentMetaAtom);
      const blocks: Block[] = get(BlocksAtom);
      const groupedBlocks = group(blocks, getComponentMeta);
      const getValidChildren = get(ValidChildrenAtom);

      function isValidChild(
        child: RaisinElementNode,
        parent: RaisinElementNode,
        slot: string
      ): boolean {
        if (child === parent) {
          // Can't drop into yourself
          // FIXME: Check for all ancestors
          return false;
        }
        ParentsAtom;
        const parentMeta = getComponentMeta(parent.tagName);
        const childMeta = getComponentMeta(child.tagName);

        // allows default HTML components to inherit its parent's custom slot names
        const slots = parentMeta.slots
          ? [
              ...parentMeta.slots,
              { name: parent.attribs.slot, title: parent.attribs.slot },
            ]
          : [];

        return isNodeAllowed(
          child,
          childMeta,
          parent,
          {
            ...parentMeta,
            slots,
          },
          slot
        );
      }

      function getSlotsInternal(node: RaisinNode): NodeWithSlots {
        return getSlots(node, getComponentMeta)!;
      }

      return {
        // Component metadata
        getComponentMeta,
        getSlots: getSlotsInternal,
        blocks,
        groupedBlocks,
        getValidChildren,
        isValidChild,
      };
    });

    const NPMRegistryAtom = atom<NPMRegistry>((get) => get(RegistryAtom));

    ComponentModelAtom.debugLabel = 'ComponentModelAtom';

    /**
     * Set of tags that are not interactible. They should only be edited as rich text.
     */
    const NonInteractibleTags = new Set<string>(DefaultTextMarks);
    const IsInteractibleAtom = atom<InteractibleProvider>(() => {
      return (node) => {
        if (node.type === 'text') return false;
        if (node.type === 'comment') return false;
        if (node.type === 'directive') return false;
        if (node.type === 'style') return true;
        if (node.type === 'root') return true;
        if (NonInteractibleTags.has(node.tagName)) return false;
        return true;
      };
    });

    return {
      ModulesAtom: PackagesAtom,
      ModuleDetailsAtom,
      ModuleDetailsStateAtom,
      ModulesLoadingAtom,
      ComponentsAtom,
      LocalURLAtom,
      BlocksAtom,
      AddModuleAtom,
      RemoveModuleAtom,
      RemoveModuleByNameAtom,
      ComponentMetaAtom,
      ValidChildrenAtom,
      ComponentModelAtom,
      IsInteractibleAtom,
      NonInteractibleTags,
      NPMRegistryAtom,
    };
  }
);

// TODO: figure out where to put examples without a group
const DEFAULT_BLOCK_GROUP = 'Default';

const DEFAULT_BLOCKS = [
  HTMLComponents.P,
  HTMLComponents.H1,
  HTMLComponents.H2,
  HTMLComponents.H3,
  HTMLComponents.H4,
];

type BlockGroups = Record<string, Block[]>;
function group(list: Block[], getComponentMeta: Function): BlockGroups {
  return list.reduce(function (allGroups: BlockGroups, block: Block) {
    const exampleGroup =
      getComponentMeta(block.content?.tagName)?.exampleGroup ??
      DEFAULT_BLOCK_GROUP;
    const groupArray = allGroups[exampleGroup] ?? [];
    const withBlock = [...groupArray, block];
    return {
      ...allGroups,
      [exampleGroup]: withBlock,
    };
  }, {} as BlockGroups);
}

/**
 * For managing the types of components that are edited and their properties
 */
export type Block = {
  title: string;
  content: RaisinElementNode;
};

export type ComponentModel = {
  getComponentMeta: ComponentMetaProvider;
  getSlots: (node: RaisinElementNode) => NodeWithSlots;
  blocks: Block[];
  groupedBlocks: { [key: string]: Block[] };
  getValidChildren: (node: RaisinNode, slot?: string) => Block[];
  isValidChild: (
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ) => boolean;
};

export type InteractibleProvider = (node: RaisinNode) => boolean;
export type ComponentMetaProvider = (tagName: string) => CustomElement;
