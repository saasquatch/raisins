import { useAtomValue } from 'jotai/utils';
import React, { CSSProperties, FC } from 'react';
import styleToObject from 'style-to-object';
import { HoveredRectAtom } from '../canvas/HoveredAtom';
import { Size } from '../canvas/useCanvas';

const Wrapper:CSSProperties = {
  backgroundImage: `linear-gradient(45deg, #cccccc 25%, transparent 25%),
    linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%),
    linear-gradient(-45deg, transparent 75%, #cccccc 75%)`,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  padding: '50px',
  position: "relative"
};

const Content = `
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
    <div style={Wrapper} onClick={() => props.clearSelected()}>
      <CanvasHover />
      <div
        style={{
          ...styleToObject(Content)!,
          width: props.size.width,
        }}
        data-content
        ref={props.setHtmlRef}
      />
    </div>
  );
};

export const CanvasHover = () => {
  const rect = useAtomValue(HoveredRectAtom);
  if (!rect) return <div style={{ position: 'absolute', top: 0, left: 0 }}>No hover</div>;
  const { x, y } = rect;

  return <div style={{ position: 'absolute', top: y, left: x }}>Hovered</div>;
};
