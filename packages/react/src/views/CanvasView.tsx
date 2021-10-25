import React, { FC } from 'react';
import styled from 'styled-components';
import { Size } from '../canvas/useCanvas';

const Wrapper = styled.div`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%),
    linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%),
    linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 50px;
`;

const Content = styled.div`
  background: white;
  margin: 0 auto;
  padding: 20px;
`;

export type WYSWIGCanvasProps = {
  size: Size;
  clearSelected: () => void;
  setHtmlRef: (el: HTMLElement | null) => void;
};

export const WYSWIGCanvas: FC<WYSWIGCanvasProps> = (props) => {
  return (
    <Wrapper onClick={() => props.clearSelected()}>
      <Content
        data-content
        style={{ width: props.size.width }}
        ref={props.setHtmlRef}
      />
    </Wrapper>
  );
};
