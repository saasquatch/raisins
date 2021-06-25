import * as Css from 'css-tree';
import { StateUpdater } from '../util/NewState';


export type StyleNodeProps<T extends Css.CssNodePlain = Css.CssNodePlain> = {
  node: T;
  setNode: StateUpdater<T>;
};

export type StyleNodeWithChildren = {
  children: Css.CssNodePlain[];
} & Css.CssNodePlain;