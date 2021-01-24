import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import { css } from '@emotion/css';
import { NodeVisitor, visit } from '../util';
import serialize from 'dom-serializer';
import * as DOMHandler from 'domhandler';
import styleToObject from 'style-to-object';
import HTML from '../components/example';

const wrapper = css`
  background-image: linear-gradient(45deg, #cccccc 25%, transparent 25%), linear-gradient(-45deg, #cccccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #cccccc 75%), linear-gradient(-45deg, transparent 75%, #cccccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  padding: 100px;
`;
const content = css`
  background: white;
  margin: 0 auto;
  padding: 20px;
`;

const Selected = css`
  outline: 1px solid red;
`;

const Selectable = css`
  &:hover {
    outline: 1px solid blue;
  }
`;

function isBlank(str: string) {
  return !str || /^\s*$/.test(str);
}

export const Canvas: FunctionalComponent<Model> = props => {
  const CanvasVisitor: NodeVisitor<VNode | string> = {
    onRoot(root, children) {
      return <div>{children}</div>;
    },
    onText(text) {
      const textValue = text.data;
      // if ((props.selected === text || props.selected === text.parent) && !isBlank(textValue)) {
      return (
        <input
          value={textValue}
          onInput={e => {
            const newText = (e.target as HTMLInputElement).value as string;
            const newNode = {
              ...text,
              data: newText,
            };
            props.replaceNode(text, newNode);
          }}
        />
      );
      // return <div ref={e => props.useInlineHTMLEditorRef(e, text)} />;
      // }
      // return textValue;
    },
    onElement(element, children) {
      const claz = element === props.selected ? Selected : Selectable;

      const onClick = (e: Event) => {
        // Relevant reading if this causes problems later: https://javascript.info/bubbling-and-capturing#stopping-bubbling
        e.stopPropagation();
        props.setSelected(element);
      };
      const innerProps = {
        class: claz + ' ' + element.attribs.class,
        onClick,
        // Don't use -- element changes evey time!
        // key: getId(element),
      };
      if (element.tagName === 'template') {
        return (
          <div {...innerProps}>
            <h1>Template:</h1>
            {children}
          </div>
        );
      }
      if (element.tagName === 'script') {
        return (
          <div {...innerProps}>
            Script:
            <br />
            <textarea>
              {
                // @ts-ignore
                serialize(element.children)
              }
            </textarea>
          </div>
        );
      }
      if (element.tagName === 'style') {
        return (
          <div>
            Style:
            <textarea>
              {
                // @ts-ignore
                // TODO: Convert from RaisinNode to DOMHandler.Node
                // serialize(element.children)
              }
            </textarea>
            {/* 
                // TODO: Convert from RaisinNode to DOMHandler.Node
            <style innerHTML={serialize(element.children)} />; */}
          </div>
        );
      }
      const { style, ...rest } = element.attribs;
      const styleObj = styleToObject(style);

      let p = { style: styleObj, ...rest, ...innerProps };
      return (
        <HTMLCompont as={element.tagName} inner={p}>
          {children}
        </HTMLCompont>
      );
    },
  };

  return (
    <div class={wrapper} onClick={() => props.setSelected(undefined)}>
      <div class={content}>{visit(props.node, CanvasVisitor)}</div>
    </div>
  );
};

const HTMLCompont: FunctionalComponent<{ as: string; inner: Record<any, any> }> = (props, children) => {
  return <props.as {...props.inner}>{children}</props.as>;
};
