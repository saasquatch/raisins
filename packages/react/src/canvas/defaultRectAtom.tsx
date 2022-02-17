import { RaisinNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { GetSoulAtom, soulToString } from '../atoms/Soul';
import type { Rect } from './api/Rect';
import type { ConnectionState } from './SnabbdomSanboxedIframeAtom';

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
  listenedPosition: Atom<Rect | undefined>
):Atom<Promise<Rect | undefined>> {
  const rectAtom = atom(async (get) => {
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
    const getSoul = get(GetSoulAtom);
    const soul = getSoul(node);
    const rect = geometry.entries.find(
      (e) => e.target?.attributes['raisins-soul'] === soulToString(soul)
    );

    return rect?.contentRect;
  });
  return rectAtom;
}
