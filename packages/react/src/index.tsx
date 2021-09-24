import React, { FC, HTMLAttributes, ReactChild } from 'react';
import {htmlParser} from "@raisins/core";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  /** custom content, defaults to 'the snozzberries taste like snozzberries' */
  children?: ReactChild;
}

// Please do not use types off of a default export module or else Storybook Docs will suffer.
// see: https://github.com/storybookjs/storybook/issues/9556
/**
 * A custom Thing component. Neat!
 */
export const Thing: FC<Props> = ({ children }) => {
  const raisin = htmlParser("<div>I am a div</div>");
  return <div>{children || JSON.stringify(raisin)}</div>;
};
