import { RaisinNode } from '@raisins/core';
import { Atom, atom } from 'jotai';
import { Soul, soulToString } from '../core/souls/Soul';
import type { Rect } from './api/Rect';
import { GeometryDetail } from './api/_CanvasRPCContract';

/**
 * Creates an asynchronous `Rect` atom that will poll for
 * the position of a node when it's undefined.
 *
 */
export function defaultRectAtom(
  geometryAtom: Atom<GeometryDetail>,
  nodeAtom: Atom<RaisinNode | undefined>,
  soulAtom: Atom<(node: RaisinNode) => Soul>,
  soulAttribute: Atom<string>
): Atom<Promise<Rect | undefined>> {
  const rectAtom = atom(async (get) => {
    const raisinsSoulAttribute = get(soulAttribute);
    const node = get(nodeAtom);
    if (!node) return undefined;

    const geometry = get(geometryAtom);
    const getSoul = get(soulAtom);
    const soul = getSoul(node);
    const rect = geometry.entries.find(
      (e) => e.target?.attributes[raisinsSoulAttribute] === soulToString(soul)
    );

    return rect?.contentRect;
  });
  return rectAtom;
}
