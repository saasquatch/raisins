import { RaisinNode } from '../../../core/src/html-dom/RaisinNode';

export type DropState = PossibleDrop;

export type Location = {
  viewElement: HTMLElement;
} & ModelLocation;

export type ModelLocation = {
  modelElement: RaisinNode;
  /**
   * Current index of the modelElement is located in the tree
   */
  idxInParent: number;
  /**
   * Slot in the parent. Shortcut for `modelElement.attribs.slot`
   */
  slotInParent: string;
};
export type PossibleDrop = {
  from: Location;
  to: Location;
};
