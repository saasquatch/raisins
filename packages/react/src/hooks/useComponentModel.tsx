import {
  htmlParser as parse,
  htmlUtil,
  RaisinElementNode,
  RaisinNodeWithChildren,
  RaisinTextNode,
} from '@raisins/core';
import * as schema from '@raisins/schema/schema';
import { ElementType } from 'domelementtype';
import { atom, useAtom } from 'jotai';
import { useAtomValue } from 'jotai/utils';
import { useMemo } from 'react';
import { NewState } from '../../../core/dist/util/NewState';
import { CustomElement } from '../component-metamodel/Component';
import * as HTMLComponents from '../component-metamodel/HTMLComponents';
import { NodeWithSlots } from '../model/EditorModel';
import { getSlots } from '../model/getSlots';
import {
  makeLocalRegistry,
  PackageJson,
  unpkgNpmRegistry,
} from '../util/NPMRegistry';
import { isElementNode, isRoot } from '../views/isNode';

const { visit } = htmlUtil;

const DEFAULT_BLOCKS: Block[] = [
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

const ComponentsAtom = atom((get) => {
  const { moduleDetails } = get(InternalStateAtom);
  return [
    ...Object.values(HTMLComponents),
    ...moduleDetails.reduce((acc, c) => {
      // A raisins package can have multiple "modules", each with their own tags
      const tags =
        c.raisins?.modules.reduce(
          (acc1, curr) => [...acc1, ...(curr.tags ?? [])],
          [] as CustomElement[]
        ) ?? [];

      return [...acc, ...tags];
    }, [] as CustomElement[]),
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
      const details: ModuleDetails[] = [];
      for (const module of next) {
        let registry = unpkgNpmRegistry;
        if (module.name === '@local' && localUrl) {
          registry = makeLocalRegistry(localUrl);
        }
        const detail = await registry.getPackageJson(module);
        let raisinPkg: schema.Package | undefined = undefined;
        if (detail.raisins) {
          const resp = await fetch(
            registry.resolvePath(module, detail.raisins)
          );
          raisinPkg = await resp.json();
        }
        details.push({
          ...module,
          'package.json': detail,
          raisins: raisinPkg,
        });
      }
      set(InternalStateAtom, {
        loading: false,
        modules: next,
        moduleDetails: details,
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
    return _internalState.moduleDetails.reduce((agg, npmMod) => {
      // Adds each NPM modules list of `raisin` contents`
      return (
        npmMod.raisins?.modules?.reduce((modBlocks, mod) => {
          // Adds examples from the top "module" level of the raisins schema
          const moduleLevelExamples =
            mod.examples?.reduce(reduceExamples, modBlocks) ?? modBlocks;

          // Adds examples from the tag level
          return (
            mod.tags?.reduce((tagBlocks, tag) => {
              return (
                tag.examples?.reduce(reduceExamples, tagBlocks) ?? tagBlocks
              );
            }, moduleLevelExamples) ?? moduleLevelExamples
          );
        }, agg) ?? agg
      );
    }, DEFAULT_BLOCKS);
  }, [_internalState.moduleDetails]);

  function isValidChild(
    from: RaisinElementNode,
    to: RaisinElementNode,
    slot: string
  ): boolean {
    if (from === to) {
      // Can't drop into yourself
      return false;
    }
    const slots = getComponentMeta(to)?.slots;
    const slotMeta = slots?.find((s) => s.name === slot);
    if (!slotMeta) return false;

    const element = visit(from, {
      onElement: (n) => n,
    });
    const parentAllowsChild =
      slotMeta.validChildren?.includes('*') ||
      (element?.tagName &&
        slotMeta.validChildren?.includes(element?.tagName)) ||
      false;

    const childMeta = getComponentMeta(from);
    const childAllowsParents = doesChildAllowParent(childMeta, to);

    return parentAllowsChild && childAllowsParents;
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

    const slotMeta = isElementNode(node)
      ? getComponentMeta(node)?.slots?.find((s) => s.name === slot)
      : undefined;

    if (!slotMeta) {
      // No meta for slot, so we assume anything is allowed
      return allowedInParent;
    }
    const { validChildren: childTags } = slotMeta;

    const filter = (block: Block) => {
      // TODO: Replace this with CSS selector implementation from core
      // TODO: Add custom pseudo selector, e.g. `:inline` for text-only slots https://github.com/fb55/css-select/blob/493cca99cd075d7bf64451bbd518325f11da084e/test/qwery.ts#L18
      const parentAllowsChild =
        childTags === undefined ||
        childTags?.includes('*') ||
        childTags?.includes(block.content.tagName);
      return parentAllowsChild;
    };
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

export type Module = {
  name: string;
  version?: string;
  filePath?: string;
};

export type ModuleDetails = {
  'package.json': PackageJson;
  raisins?: schema.Package;
} & Module;

export type Block = {
  title: string;
  content: RaisinElementNode;
};

export type ComponentModel = {
  loadingModules: boolean;
  modules: Module[];
  moduleDetails: ModuleDetails[];
  addModule(module: Module): void;
  removeModule(module: Module): void;
  removeModuleByName(name: string): void;
  setModules(moduleS: Module[]): void;
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

function reduceExamples(
  previousValue: Block[],
  currentValue: schema.Example
): Block[] {
  const elm = blockFromHtml(currentValue.content);
  if (!elm) return previousValue;
  const blockExample = {
    title: currentValue.title,
    content: elm,
  };
  return [...previousValue, blockExample];
}

function doesChildAllowParent(
  childMeta: CustomElement,
  to: RaisinNodeWithChildren
): boolean {
  let tagName: string | undefined = undefined;

  if (isRoot(to)) {
    // Root element is always allowed.
    // This allows editing for fragments, since Root !== body
    return true;
  }

  if (isElementNode(to)) {
    tagName = to.tagName;
  }

  const hasConstraints = childMeta?.validParents !== undefined;
  if (!hasConstraints) {
    // No constraints, so all parents are allowed.
    return true;
  }

  if (hasConstraints && !tagName) {
    // If a child specifies a set of valid parents, it will not allow it parent elements without tag names (e.g. comments)
    return false;
  }

  if (tagName && childMeta?.validParents?.includes(tagName)) {
    // Child allows parent
    return true;
  }
  return false;
}

function blockFromHtml(html: string): RaisinElementNode | undefined {
  try {
    return parse(html).children[0] as RaisinElementNode;
  } catch (e) {
    return undefined;
  }
}
