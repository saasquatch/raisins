import {
  RaisinDocumentNode,
  RaisinElementNode,
  RaisinNode,
} from '@raisins/core';
import { Atom, atom, WritableAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { ComponentModelMolecule } from '../component-metamodel';
import {
  CoreMolecule,
  PickAndPlopMolecule,
  SelectedNodeMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../core';
import { Soul } from '../core/souls/Soul';
import { NodeMolecule } from '../node';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import {
  GeometryDetail,
  GeometryEntry,
  RawCanvasEvent,
} from './api/_CanvasRPCContract';
import { CanvasConfigMolecule } from './CanvasConfig';
import { CanvasScope } from './CanvasScope';
import { CanvasScriptsMolecule } from './CanvasScriptsMolecule';
import { createAtoms } from './iframe/SnabbdomSanboxedIframeAtom';
import {
  combineAppenders,
  combineRenderers,
  raisinToSnabbdom,
  SnabbdomAppender,
  SnabbdomRenderer,
} from './util/raisinToSnabdom';

type CanvasEventListener = WritableAtom<null, RichCanvasEvent>;

/**
 * Used to "burn down" a snabbdom view for full replacement instead of incremental replacement.
 *
 * This is useful for web components that don't use shadow dom, (e.g. stencil components with shadow:false)
 * and therefore need to have their HTML fully reconstructed on every render to ensure consistency.
 *
 * An example during development was `sqm-text`, which threw and exception in snabbdom and caused infinite plop targets to show up.
 */
let renderTick = 0;

/**
 * A molecule used for tracking events and geometry for an iframe canvas.
 *
 * Has mutable a set of listeners for dealing with events
 *
 * Must be used inside a {@link CanvasProvider}
 */
export const CanvasScopeMolecule = molecule((getMol, getScope) => {
  const value = getScope(CanvasScope);
  if (!value) throw new Error('Must be rendered in a <CanvasProvider/>');

  const ComponentModelAtoms = getMol(ComponentModelMolecule);
  const CanvasConfig = getMol(CanvasConfigMolecule);
  const ComponentModel = getMol(ComponentModelMolecule);
  const { EventAttributeAtom: EventSelectorAtom } = CanvasConfig;
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { CanvasScriptsAtom } = getMol(CanvasScriptsMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);
  const { rerenderNodeAtom } = getMol(CoreMolecule);
  const { PloppingIsActive } = getMol(PickAndPlopMolecule);
  const HTMLSet = new Set<Atom<string>>();
  const AppendersSet = new Set<Atom<SnabbdomAppender>>([]);
  const RendererSet = new Set<Atom<SnabbdomRenderer>>([]);
  const ListenersMap = new Map<string, Set<CanvasEventListener>>([]);
  const addEventListener = (type: string, listener: CanvasEventListener) => {
    let set = ListenersMap.get(type);
    if (!set) {
      set = new Set();
      ListenersMap.set(type, set);
    }
    set.add(listener);
    return () => set?.delete(listener);
  };

  const VnodeAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const raisinsSoulAttribute = get(CanvasConfig.SoulAttributeAtom);
    const raisinEventAttribute = get(EventSelectorAtom);
    const meta = get(ComponentModel.ComponentModelAtom);
    const rerender = get(rerenderNodeAtom);
    const picked = get(PloppingIsActive);

    const isInteractible = get(ComponentModelAtoms.IsInteractibleAtom);
    const renderers = Array.from(RendererSet.values()).map(
      (a) => get(a) as SnabbdomRenderer
    );
    const eventsRenderer: SnabbdomRenderer = (d, n) => {
      const soul = souls(n);
      if (!isInteractible(n)) return d;
      const componentMeta = meta.getComponentMeta(n.tagName);

      const canvasRenderer = componentMeta.canvasRenderer ?? 'in-place-update';

      // Only replace if duplicating or pick-and-plopping to prevent misaligned toolbars, flickering, and errors
      const useCanvasRenderer =
        (picked || rerender) && canvasRenderer === 'always-replace';

      const key = useCanvasRenderer ? ++renderTick : soul.toString();

      return {
        ...d,
        key,
        attrs: {
          ...d.attrs,
          [raisinsSoulAttribute]: soul.toString(),
          [raisinEventAttribute]: true,
        },
        resizeObserver: true,
      };
    };
    const renderer = combineRenderers(eventsRenderer, ...renderers);
    const appenders = Array.from(AppendersSet.values()).map((a) => get(a));
    const appender = combineAppenders(...appenders);

    const vnode = raisinToSnabbdom(
      node as RaisinDocumentNode,
      renderer,
      appender
    );

    return vnode;
  });
  VnodeAtom.debugLabel = 'VnodeAtom';

  const CanvasEventAtom = atom(null, (get, set, e: RawCanvasEvent) => {
    const listenersSet = ListenersMap.get(e.type);
    if (!listenersSet || listenersSet.size === 0) return;

    const idToSoul = get(IdToSoulAtom);
    const raisinsAttribute = get(CanvasConfig.SoulAttributeAtom);
    const soulId = e.target?.attributes[raisinsAttribute];
    const soul = soulId ? idToSoul(soulId) : undefined;
    const soulToNode = get(SoulToNodeAtom);
    const node = soul ? soulToNode(soul) : undefined;

    const betterEvent: RichCanvasEvent = { ...e, soul, node };
    for (const listener of listenersSet.values()) {
      set(listener, betterEvent);
    }
  });

  const EventTypesAtom = atom((get) => {
    return new Set(ListenersMap.keys());
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (get, set, next: GeometryDetail) => {
    const existing = get(GeometryAtom);
    const geometryMap = new Map();
    const raisinsAttribute = get(CanvasConfig.SoulAttributeAtom);

    existing.entries?.forEach((geo) => {
      if (!geo.target?.attributes[raisinsAttribute]) return;
      geometryMap.set(geo.target?.attributes[raisinsAttribute], geo);
    });

    next.entries?.forEach((geo) => {
      if (!geo.target?.attributes[raisinsAttribute]) return;
      geometryMap.set(geo.target?.attributes[raisinsAttribute], geo);
    });

    const geometry = Array.from(geometryMap.values()).map(
      (geo) => geo
    ) as GeometryEntry[];

    const newGeometry = { entries: geometry };
    set(GeometryAtom, newGeometry);
  });

  const IframeHeadAtom = atom((get) => {
    const script = get(CanvasScriptsAtom);
    const extra = CanvasConfig.IframeHead ? get(CanvasConfig.IframeHead) : '';
    const bonus = Array.from(HTMLSet.values())
      .map((a) => get(a))
      .join('');
    return script + extra + bonus;
  });

  const selector = atom((get) => `[${get(EventSelectorAtom)}]`);
  const IframeAtom = createAtoms({
    head: IframeHeadAtom,
    registry: NPMRegistryAtom,
    selector,
    eventTypes: EventTypesAtom,
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: SetGeometryAtom,
  });

  return {
    HTMLSet,
    ListenersMap,
    addEventListener,
    GeometryAtom,
    IframeAtom,
    AppendersSet,
    RendererSet,
  };
});

export type RichCanvasEvent = RawCanvasEvent & {
  soul?: Soul;
  node?: RaisinNode;
};
