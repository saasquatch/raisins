import type { CssNodePlain } from 'css-tree';
import { StateUpdater } from '../util/NewState';


export type StyleNodeProps<T extends CssNodePlain = CssNodePlain> = {
  node: T;
  setNode: StateUpdater<T>;
};

export type StyleNodeWithChildren = {
  children: CssNodePlain[];
} & CssNodePlain;