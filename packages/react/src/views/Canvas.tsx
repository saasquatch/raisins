import React, { FC } from 'react';
import styled from 'styled-components';
import { Model } from '../model/EditorModel';

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

export const Canvas: FC<Model> = (props) => {
  return (
    <div>
      <div style={{ display: props.mode === 'html' ? 'block' : 'none' }}>
        <textarea
          value={props.serialized}
          onChange={(e) =>
            props.setHtml((e.target as HTMLTextAreaElement).value)
          }
          style={{
            width: '100%',
            minHeight: '50vh',
            boxSizing: 'border-box',
            resize: 'vertical',
          }}
        />
      </div>
      <div style={{ display: props.mode !== 'html' ? 'block' : 'none' }}>
        <WYSWIGCanvas {...props} />
      </div>
    </div>
  );
};
export const WYSWIGCanvas: FC<Model> = (props) => {
  return (
    <Wrapper onClick={() => props.setSelected(undefined as any)}>
      <Content
        data-content
        style={{ width: props.size.width }}
        ref={(el: HTMLDivElement) => (props.containerRef.current = el!)}
      />
    </Wrapper>
  );
};
