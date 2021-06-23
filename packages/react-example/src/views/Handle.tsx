import React from "react"
import { css } from '@emotion/css';

export const Grippy = css`
  content: '....';
  width: 10px;
  height: 20px;
  display: inline-block;
  overflow: hidden;
  line-height: 5px;
  padding: 3px 4px;
  cursor: move;
  vertical-align: middle;
  margin-top: -0.7em;
  margin-right: 0.3em;
  font-size: 12px;
  font-family: sans-serif;
  letter-spacing: 2px;
  color: #cccccc;
  text-shadow: 1px 0 1px black;
  &::after {
    content: '.. .. .. ..';
  }
`;

export function Handle() {
  return <span className={Grippy} data-draggable />;
}
