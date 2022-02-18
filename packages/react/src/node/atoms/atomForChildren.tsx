import { RaisinNode } from '@raisins/core';
import { PrimitiveAtom } from 'jotai';
import { focusAtom } from 'jotai/optics';
import { OpticFor } from 'optics-ts';

const childOptic = (o: OpticFor<RaisinNode>) =>
  o.prop('children' as any).valueOr([]);

export function atomForChildren(
  nodeAtom: PrimitiveAtom<RaisinNode>
): PrimitiveAtom<RaisinNode[]> {
  return focusAtom(nodeAtom, childOptic);
}
