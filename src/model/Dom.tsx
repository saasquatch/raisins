import * as DOMHandler from 'domhandler';

export type Model = {
  node: DOMHandler.Node;
  setState(node: DOMHandler.Node): void;
};

export type Block = {
  name: string;
  tag: string;
};
