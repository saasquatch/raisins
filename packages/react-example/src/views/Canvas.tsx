import { css } from '@emotion/css';
import { cssSerializer, htmlSerializer, htmlUtil, RaisinElementNode, RaisinStyleNode, RaisinNodeVisitor as NodeVisitor } from '@raisins/core';
import { Model } from '../model/EditorModel';
import React, { FC, ReactNode } from 'react';
import styleToObject from 'style-to-object';

const { visit } = htmlUtil;

const wrapper = css`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 50px;
`;


const content = css`
  background: white;
  margin: 0 auto;
  padding: 20px;
`;

export const Canvas: FC<Model> = props => {
  if (props.mode === 'html') {
    return <pre>{props.serialized}</pre>;
  }
  return <WYSWIGCanvas {...props} />;
};
export const WYSWIGCanvas: FC<Model> = props => {
  const CanvasVisitor: NodeVisitor<ReactNode> = {
    onCData() {
      return '';
    },
    onComment() {
      return '';
    },
    onDirective() {
      return '';
    },
    onRoot(_: any, children: ReactNode) {
      return <div>{children}</div>;
    },
    onText(text: { data: any }) {
      const textValue = text.data;
      return textValue;
    },
    onStyle(style: RaisinStyleNode) {
      const cssContent = style.contents && cssSerializer(style.contents);
      return (
        <style
          dangerouslySetInnerHTML={{
            __html: cssContent ?? '',
          }}
        />
      );
    },
    onElement(element: RaisinElementNode, children: ReactNode) {
      const innerProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> = {
        // @ts-ignore - doesnt like `data` props
        'data-id': props.getId(element),
        'className': element.attribs.class,
      };
      const canvasStyle = {
        outline: element === props.selected ? '2px solid red' : '',
        outlineOffset: element === props.selected ? "-2px" : ''
      };
      const { ...rest } = element.attribs;
      let styleObj;
      try {
        styleObj = styleToObject(cssSerializer(element.style));
      } catch (e) {
        styleObj = {};
      }

      let p = { style: { ...styleObj, ...canvasStyle }, ...rest, ...innerProps, children };
      return <HTMLCompont as={element.tagName} inner={p} />;
    },
  };

  const ContentComponent: FC = () => {
    return <>{visit(props.node, CanvasVisitor)}</>;
  };

  props.renderInIframe(ContentComponent);

  return (
    <div className={wrapper} onClick={() => props.setSelected(undefined as any)}>
      <div className={content} data-content style={{ width: props.size.width }} ref={el => (props.containerRef.current = el!)}></div>
    </div>
  );
};

const HTMLCompont: FC<{ as: string; inner: Record<any, any> }> = props => {
  return React.createElement(props.as, props.inner);
};
