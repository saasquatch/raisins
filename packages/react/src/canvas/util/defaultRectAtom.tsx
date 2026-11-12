import type { RaisinNode } from '@raisins/core';
import type { Atom } from 'jotai';
import { atom } from 'jotai';
import type { Soul } from '../../core/souls/Soul.ts';
import { soulToString } from '../../core/souls/Soul.ts';
import type { Rect } from '../types.tsx';
import type { GeometryDetail } from '../api/_CanvasRPCContract.tsx';

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
): Atom<Rect | undefined> {
  const rectAtom = atom((get) => {
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
