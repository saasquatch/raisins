import { isElementNode, RaisinDocumentNode } from '@raisins/core';
import { atom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { h, VNode, VNodeStyle } from 'snabbdom';
import { ComponentModelMolecule } from '../component-metamodel/ComponentModel';
import { CoreMolecule } from '../core/CoreAtoms';
import { HoveredNodeMolecule } from '../core/selection/HoveredNode';
import { PickedNodeMolecule } from '../core/selection/PickedNode';
import { SelectedNodeMolecule } from '../core/selection/SelectedNode';
import { SoulsMolecule } from '../core/souls/Soul';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScriptsMolecule } from './CanvasScriptsAtom';
import {
  raisintoSnabdom,
  SnabdomAppender,
  SnabdomRenderer,
} from './raisinToSnabdom';

export type Size = {
  name: string;
  width: string;
  height: number;
};

export type Mode = 'preview' | 'edit';

export const sizes: Size[] = [
  { name: 'Auto', width: 'auto', height: 1080 },
  { name: 'Large', width: '992px', height: 1080 },
  { name: 'Medium', width: '768px', height: 1080 },
  { name: 'Small', width: '576px', height: 1080 },
  { name: 'X-Small', width: '400px', height: 1080 },
];

export const CanvasStyleMolecule = molecule((getMol) => {
  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { ComponentModelAtom } = getMol(ComponentModelMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { HoveredNodeAtom } = getMol(HoveredNodeMolecule);
  const { PickedNodeAtom, PloppingIsActive } = getMol(PickedNodeMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { SelectedNodeAtom } = getMol(SelectedNodeMolecule);
  const { CanvasScriptsAtom } = getMol(CanvasScriptsMolecule);
  const OutlineAtom = atom(true);
  const ModeAtom = atom<Mode>('edit');
  const SizeAtom = atom<Size>(sizes[0]);

  const VnodeAtom = atom((get) => {
    const mode = get(ModeAtom);
    const selected = get(SelectedNodeAtom);
    const hovered = get(HoveredNodeAtom);
    const outlined = get(OutlineAtom);
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const isPloppingActive = get(PloppingIsActive);
    const pickedNode = get(PickedNodeAtom);
    const metamodel = get(ComponentModelAtom);
    const raisinsSoulAttribute = get(CanvasOptions.SoulAttributeAtom);

    const renderer: SnabdomRenderer = (d, n) => {
      if (mode === 'preview') {
        return d;
      }
      const isHovered = hovered === n;
      const isSelected = selected === n;
      const isOutlined = isHovered || isSelected;
      const { delayed, remove, ...rest } = d.style || {};
      const style: VNodeStyle = {
        ...rest,
        cursor: 'pointer',
        outline: isHovered
          ? '2px solid green'
          : isSelected
          ? '2px solid rgba(255,0,0,0.5)'
          : outlined
          ? '1px dashed rgba(0,0,0,0.2)'
          : '',
        outlineOffset: isOutlined ? '-2px' : '',
      };
      let propsToRender: Record<string, any> = {};

      const soul = souls(n);
      return {
        ...d,
        attrs: {
          ...d.attrs,
          [raisinsSoulAttribute]: soul.toString(),
          'raisins-events': true,
        },
        style,
        props: propsToRender,
      };
    };

    const appender: SnabdomAppender = (c, n) => {
      // 0 - infer plop targets from slot names and metamodel
      // 1 - only render appropriate plop targets
      // 2 - render pretty plop targets (See Head atom)
      // 3 - add appropriate attrs to make `onClick` work (and rewrite select-on-click stuff)
      if (!pickedNode || !isElementNode(pickedNode)) return c;
      if (!isPloppingActive || !isElementNode(n)) return c;
      const parent = n;

      // TODO: Root node should allow any children
      if (!isElementNode(parent)) return c;

      const slot = n.attribs.slot ?? '';
      const isValid = metamodel.isValidChild(pickedNode, parent, slot);
      if (!isValid) return c;
      const soulId = souls(parent).toString();

      const newChildren =
        c?.reduce((acc, child, idx) => {
          const plopTarget = createPlopTargetNode({ idx, slot, soulId });
          return [...acc, plopTarget, child];
        }, [] as Array<string | VNode>) ?? [];
      return newChildren;
    };
    const vnode = raisintoSnabdom(
      node as RaisinDocumentNode,
      renderer,
      appender
    );

    return vnode;
  });
  VnodeAtom.debugLabel = 'VnodeAtom';

  function createPlopTargetNode({
    soulId,
    slot,
    idx,
  }: {
    idx: number;
    soulId: string;
    slot: string;
  }) {
    return h(
      'div',
      {
        attrs: {
          slot,
          'raisin-plop-target': true,
          'raisin-plop-parent': soulId,
          'raisin-plop-slot': slot,
          'raisin-plop-idx': idx,
          'raisins-events': true,
        },
      },
      'Plop here'
    );
  }

  const IframeHeadAtom = atom((get) => {
    const script = get(CanvasScriptsAtom);
    const styles = `<style>
      [raisin-plop-target]{
        background: yellow;
  
      }
      [raisin-plop-target]:hover{
        outline: 1px solid red;
      }
    </style>
    `;
    return script + styles;
  });

  return {
    OutlineAtom,
    ModeAtom,
    SizeAtom,
    VnodeAtom,
    IframeHeadAtom,
  };
});
