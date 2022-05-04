import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { Atom, atom, WritableAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import { proxySet } from 'valtio/utils';
import { ComponentModelMolecule } from '../component-metamodel';
import { CoreMolecule, SoulsInDocMolecule, SoulsMolecule } from '../core';
import { Soul } from '../core/souls/Soul';
import { NPMRegistryAtom } from '../util/NPMRegistry';
import { GeometryDetail, RawCanvasEvent } from './api/_CanvasRPCContract';
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

  const CanvasConfig = getMol(CanvasConfigMolecule);
  const ComponentModel = getMol(ComponentModelMolecule);
  const { EventAttributeAtom: EventSelectorAtom } = CanvasConfig;
  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { CanvasScriptsAtom } = getMol(CanvasScriptsMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  const HTMLSet = new Set<Atom<string>>();
  const AppendersSet = new Set<Atom<SnabbdomAppender>>([]);
  const RendererSet = new Set<Atom<SnabbdomRenderer>>([]);
  const ListenersSet = new Set<CanvasEventListener>([]);

  const VnodeAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const meta = get(ComponentModel.ComponentModelAtom);
    const raisinsSoulAttribute = get(CanvasOptions.SoulAttributeAtom);

    const renderers = Array.from(RendererSet.values()).map(
      (a) => get(a) as SnabbdomRenderer
    );
    const eventsRenderer: SnabbdomRenderer = (d, n) => {
      const soul = souls(n);
      const componentMeta = meta.getComponentMeta(n.tagName);

      const canvasRenderer = componentMeta.canvasRenderer ?? 'in-place-update';
      const key =
        canvasRenderer === 'always-replace' ? ++renderTick : soul.toString();

      return {
        ...d,
        key,
        attrs: {
          ...d.attrs,
          [raisinsSoulAttribute]: soul.toString(),
          'raisins-events': true,
        },
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
    const idToSoul = get(IdToSoulAtom);
    const raisinsAttribute = get(CanvasConfig.SoulAttributeAtom);
    const soulId = e.target?.attributes[raisinsAttribute];
    const soul = soulId ? idToSoul(soulId) : undefined;
    const soulToNode = get(SoulToNodeAtom);
    const node = soul ? soulToNode(soul) : undefined;

    const betterEvent: RichCanvasEvent = { ...e, soul, node };
    for (const listener of ListenersSet.values()) {
      sett(listener, betterEvent);
    }
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (_, set, next: GeometryDetail) =>
    set(GeometryAtom, next)
  );

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
    vnodeAtom: VnodeAtom,
    onEvent: CanvasEventAtom,
    onResize: SetGeometryAtom,
  });

  return {
    HTMLSet,
    ListenersSet,
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
