import { newCoordsSet } from '@interactjs/core/tests/_helpers';
import { ComponentType } from '../../model/Component';

import * as HTMLComponents from '../../model/HTMLComponents';
import { RaisinElementNode } from '../../model/RaisinNode';

const components: ComponentType[] = [...Object.values(HTMLComponents)];
/**
 * For managing the types of components that are edited and their properties
 */
export function useComponentModel() {
  function getComponentMeta(node: RaisinElementNode) {
    return components.find(c => c.tagName === node.tagName);
  }

  return {
    getComponentMeta,
  };
}
