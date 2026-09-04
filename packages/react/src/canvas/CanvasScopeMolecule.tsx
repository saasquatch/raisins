import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { molecule } from 'bunshi/react';
import { Atom, atom, WritableAtom } from 'jotai';
import { h, VNodeChildElement, VNodeChildren } from 'snabbdom';
import { ComponentModelMolecule } from '../component-metamodel';
import {
  CoreMolecule,
  PickAndPlopMolecule,
  SoulsInDocMolecule,
  SoulsMolecule,
} from '../core';
import { CssEditingMolecule } from '../css-editing/CssEditingMolecule';
import { Soul } from '../core/souls/Soul';
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
import { createProxy } from './ProxySet';
import { RootRenderer } from './types';
import {
  combineAppenders,
  combineRenderers,
  raisinToSnabbdom,
  SnabbdomAppender,
  SnabbdomRenderer,
} from './util/raisinToSnabdom';

type CanvasEventListener = WritableAtom<null, RichCanvasEvent[], void>;

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
 * Stable key so snabbdom patches the managed stylesheet's text in place.
 */
const MANAGED_STYLE_KEY = 'raisin-managed-style';

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
  const { ManagedStyleSheetAtom } = getMol(CssEditingMolecule);
  const HTMLSet = new Set<Atom<string>>();
  const AppendersSet = new Set<Atom<SnabbdomAppender>>([]);
  const RendererSet = new Set<Atom<SnabbdomRenderer>>([]);
  const RootRendererProxy = createProxy<Atom<RootRenderer>>();
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

  const VnodeAtom = atom(get => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const raisinsSoulAttribute = get(CanvasConfig.SoulAttributeAtom);
    const raisinEventAttribute = get(EventSelectorAtom);
    const meta = get(ComponentModel.ComponentModelAtom);
    const rerender = get(rerenderNodeAtom);
    const picked = get(PloppingIsActive);
    const managedCss = get(ManagedStyleSheetAtom);

    const isInteractible = get(ComponentModelAtoms.IsInteractibleAtom);
    const renderers = Array.from(RendererSet.values()).map(
      a => get(a) as SnabbdomRenderer
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
    const appenders = Array.from(AppendersSet.values()).map(a => get(a));
    const appender = combineAppenders(...appenders);

    const rootRenderers = Array.from(
      get(RootRendererProxy.atom).values
    ).map(r => get(r));
    const composedRootRenderer = rootRenderers.reduce<RootRenderer>(
      (prev, renderer) => {
        return (c, n) => renderer(prev(c, n), n);
      },
      c => c
    );

    // Applied after plugin root renderers so the stylesheet can't be swallowed
    // by a wrapping renderer (e.g. one that moves children into a shadow root).
    const rootRenderer: RootRenderer = (c, n) => {
      const inner = composedRootRenderer(c, n);
      const managedStyle = h(
        'style',
        { key: MANAGED_STYLE_KEY, attrs: { 'data-raisin-managed': true } },
        managedCss
      );
      return [managedStyle, ...toChildArray(inner)];
    };

    const vnode = raisinToSnabbdom(
      node as RaisinDocumentNode,
      renderer,
      appender,
      rootRenderer
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

  const EventTypesAtom = atom(() => {
    return new Set(ListenersMap.keys());
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (get, set, next: GeometryDetail) => {
    const existing = get(GeometryAtom);
    const geometryMap = new Map();
    const raisinsAttribute = get(CanvasConfig.SoulAttributeAtom);

    const keyFor = (geo: GeometryEntry): string | undefined => {
      const attrs = geo.target?.attributes;
      if (!attrs) return undefined;
      const soulId = attrs[raisinsAttribute];
      if (soulId) return `soul:${soulId}`;
      // Also track plop targets so parent-side overlays (e.g. canvas drag
      // and drop) can locate them via the cursor position.
      // NOTE: boolean snabbdom attrs become empty-string DOM attrs, so we
      // use `in` rather than a truthy check.
      if ('raisin-plop-target' in attrs) {
        return `plop:${attrs['raisin-plop-parent']}/${attrs['raisin-plop-slot']}/${attrs['raisin-plop-idx']}`;
      }
      return undefined;
    };

    // For a *full* snapshot (dispatched after every iframe render), discard
    // any existing entries first so elements that no longer exist in the
    // iframe (e.g. plop targets removed when a drag ends) are evicted.
    // For partial deltas (ResizeObserver callbacks), preserve existing
    // entries and merge the new ones in.
    if (!next.full) {
      existing.entries?.forEach(geo => {
        const key = keyFor(geo);
        if (key) geometryMap.set(key, geo);
      });
    }

    next.entries?.forEach(geo => {
      const key = keyFor(geo);
      if (key) geometryMap.set(key, geo);
    });

    const geometry = Array.from(geometryMap.values()).map(
      geo => geo
    ) as GeometryEntry[];

    const newGeometry = { entries: geometry };
    set(GeometryAtom, newGeometry);
  });

  const IframeHeadAtom = atom(get => {
    const script = get(CanvasScriptsAtom);
    const extra = CanvasConfig.IframeHead ? get(CanvasConfig.IframeHead) : '';
    const bonus = Array.from(HTMLSet.values())
      .map(a => get(a))
      .join('');
    return script + extra + bonus;
  });

  const selector = atom(get => `[${get(EventSelectorAtom)}]`);
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
    RootRendererSet: RootRendererProxy.set,
  };
});

export type RichCanvasEvent = RawCanvasEvent & {
  soul?: Soul;
  node?: RaisinNode;
};

function toChildArray(children: VNodeChildren): VNodeChildElement[] {
  if (children === undefined || children === null) return [];
  return Array.isArray(children) ? children : [children];
}
