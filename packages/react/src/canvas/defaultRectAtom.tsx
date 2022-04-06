import { RaisinNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { Soul, soulToString } from '../core/souls/Soul';
import type { Rect } from './api/Rect';
import { CanvasOptions } from './CanvasOptionsMolecule';
import type { ConnectionState } from './iframe/SnabbdomSanboxedIframeAtom';

/**
 * Creates an asynchronous `Rect` atom that will poll for
 * the position of a node when it's undefined.
 *
 * @param connection
 * @param nodeAtom
 * @param listenedPosition
 * @returns
 */
export function defaultRectAtom(
  connection: Atom<ConnectionState>,
  nodeAtom: Atom<RaisinNode | undefined>,
  soulAtom: Atom<(node: RaisinNode) => Soul>,
  listenedPosition: Atom<Rect | undefined>,
  CanvasOptions: CanvasOptions
): Atom<Promise<Rect | undefined>> {
  const rectAtom = atom(async (get) => {
    const raisinsSoulAttribute = get(CanvasOptions.SoulAttributeAtom);
    const node = get(nodeAtom);
    if (!node) return undefined;
    // When node changes, then lookup initial value
    const latest = get(listenedPosition);
    if (latest) return latest;

    const connState = get(connection);

    if (connState.type !== 'loaded') {
      return undefined;
    }

    const geometry = await connState.childRpc.geometry();
    const getSoul = get(soulAtom);
    const soul = getSoul(node);
    const rect = geometry.entries.find(
      (e) => e.target?.attributes[raisinsSoulAttribute] === soulToString(soul)
    );

    return rect?.contentRect;
  });
  return rectAtom;
}
