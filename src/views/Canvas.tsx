import { h, FunctionalComponent } from '@stencil/core';
import { Model } from '../model/Dom';
import serialize from 'dom-serializer';
import { css } from '@emotion/css';

const wrapper = css`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 100px;
`;
const content = css`
  background: white;
  width: 500px;
  margin: 0 auto;
  padding: 20px;
`;

export const Canvas: FunctionalComponent<Model> = props => {
  const fragment = serialize(props.node.cloneNode(true));
  const body = `<html>
  <body>
    ${fragment}
  </body>
  </html>`;

  return (
    <div class={wrapper}>
      <div class={content} innerHTML={body}></div>
    </div>
  );
};
