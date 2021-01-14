import * as DOMHandler from 'domhandler';

export type Model = {
  node: DOMHandler.Node;
  setState(node: DOMHandler.Node): void;
  selected?: DOMHandler.Node;
  setSelected(node: DOMHandler.Node): void;
  removeNode(node: DOMHandler.Node): void;
  undo(): void;
  redo(): void;
  hasUndo: boolean;
  hasRedo: boolean;
};

export type Block = {
  name: string;
  tag: string;
};
