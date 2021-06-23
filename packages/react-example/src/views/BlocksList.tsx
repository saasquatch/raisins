import { css } from '@emotion/css';
import React from "react";
import { Model } from '@raisins/core';
import { Handle } from './Handle';

const Block = css`
  padding: 20px;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 3px;
`;

export default function BlocksList(props: Model) {
  return (
    <div>
      <h1>Blocks</h1>
      {props.blocks.map(block => {
        // TODO: Make draggable onto the canvas or onto into layers
        const meta = props.getComponentMeta(block);
        return (
          <div className={Block}>
            <Handle />
            {meta.title}
          </div>
        );
      })}
    </div>
  );
}
