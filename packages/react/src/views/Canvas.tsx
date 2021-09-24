import styled from 'styled-components';
import { cssSerializer, htmlUtil, RaisinElementNode, RaisinNodeVisitor as NodeVisitor, RaisinStyleNode } from '@raisins/core';
import React, { FC, ReactNode } from 'react';
import styleToObject from 'style-to-object';
import { Model } from '../model/EditorModel';

const { visit } = htmlUtil;

const Wrapper = styled.div`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 50px;
`;

const Content = styled.div`
  background: white;
  margin: 0 auto;
  padding: 20px;
`;

export const Canvas: FC<Model> = props => {
  return (
    <div>
      <div style={{ display: props.mode === 'html' ? 'block' : 'none' }}>
        <textarea
          value={props.serialized}
          onChange={e => props.setHtml((e.target as HTMLTextAreaElement).value)}
          style={{ width: '100%', minHeight: '50vh', boxSizing: 'border-box', resize: 'vertical' }}
        />
      </div>
      <div style={{ display: props.mode !== 'html' ? 'block' : 'none' }}>
        <WYSWIGCanvas {...props} />
      </div>
    </div>
  );
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
        cursor: 'pointer',
        outline: element === props.selected ? '2px solid red' : '',
        outlineOffset: element === props.selected ? '-2px' : '',
      };
      const { ...rest } = element.attribs;
      let styleObj;
      try {
        if(element.style){
          styleObj = styleToObject(cssSerializer(element.style));
        }
      } finally {
        styleObj = styleObj || {};
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
    <Wrapper onClick={() => props.setSelected(undefined as any)}>
      <Content data-content style={{ width: props.size.width }} ref={(el:HTMLDivElement) => (props.containerRef.current = el!)} />
    </Wrapper>
  );
};

const HTMLCompont: FC<{ as: string; inner: Record<any, any> }> = props => {
  return React.createElement(props.as, props.inner);
};
