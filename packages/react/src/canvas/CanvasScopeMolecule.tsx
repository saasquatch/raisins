import { RaisinDocumentNode, RaisinNode } from '@raisins/core';
import { Atom, atom, WritableAtom } from 'jotai';
import { molecule } from 'jotai-molecules';
import { atomWithProxy } from 'jotai/valtio';
import { proxySet } from 'valtio/utils';
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
  const { EventAttributeAtom: EventSelectorAtom } = CanvasConfig;
  const CanvasOptions = getMol(CanvasConfigMolecule);
  const { RootNodeAtom } = getMol(CoreMolecule);
  const { GetSoulAtom } = getMol(SoulsMolecule);
  const { CanvasScriptsAtom } = getMol(CanvasScriptsMolecule);
  const { IdToSoulAtom, SoulToNodeAtom } = getMol(SoulsInDocMolecule);

  const AppendersSet = proxySet<Atom<SnabbdomAppender>>([]);
  const RendererSet = proxySet<Atom<SnabbdomRenderer>>([]);
  const AppendersAtom = atomWithProxy(AppendersSet);
  const RendererAtom = atomWithProxy(RendererSet);
  const ListenersSet = proxySet<CanvasEventListener>([]);

  const VnodeAtom = atom((get) => {
    const node = get(RootNodeAtom);
    const souls = get(GetSoulAtom);
    const raisinsSoulAttribute = get(CanvasOptions.SoulAttributeAtom);
    const renderersAtoms = get(RendererAtom);
    if (!renderersAtoms) return raisinToSnabbdom(node as RaisinDocumentNode);
    const renderers = Array.from(renderersAtoms.values()).map(
      (a) => get(a) as SnabbdomRenderer
    );
    const eventsRenderer: SnabbdomRenderer = (d, n) => {
      const soul = souls(n);
      return {
        ...d,
        attrs: {
          ...d.attrs,
          [raisinsSoulAttribute]: soul.toString(),
          'raisins-events': true,
        },
      };
    };
    const renderer = combineRenderers(eventsRenderer, ...renderers);

    if (!renderersAtoms)
      return raisinToSnabbdom(node as RaisinDocumentNode, renderer);
    const appendersAtoms = get(AppendersAtom);

    const appenders = Array.from(appendersAtoms.values()).map((a) => get(a));
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
      set(listener, betterEvent);
    }
  });

  const GeometryAtom = atom({ entries: [] } as GeometryDetail);
  const SetGeometryAtom = atom(null, (_, set, next: GeometryDetail) =>
    set(GeometryAtom, next)
  );

  const IframeHeadAtom = atom((get) => {
    const script = get(CanvasScriptsAtom);
    const extra = CanvasConfig.IframeHead ? get(CanvasConfig.IframeHead) : '';
    return script + extra;
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
    ListenersSet,
    GeometryAtom,
    IframeAtom,
    AppendersSet,
    AppendersAtom,
    RendererSet,
    RendererAtom,
  };
});

export type RichCanvasEvent = RawCanvasEvent & {
  soul?: Soul;
  node?: RaisinNode;
};
