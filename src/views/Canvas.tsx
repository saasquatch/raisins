import { h, FunctionalComponent, VNode } from '@stencil/core';
import { Model } from '../model/Dom';
import { css } from '@emotion/css';
import { NodeVisitor, visit } from '../util';
import serialize from 'dom-serializer';
import { getId } from '../components/raisin-editor/useEditor';
import * as DOMHandler from 'domhandler';

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

  .selected {
    outline: 1px solid red;
  }
`;


function isBlank(str:string) {
  return (!str || /^\s*$/.test(str));
}

export const Canvas: FunctionalComponent<Model> = props => {
  const CanvasVisitor: NodeVisitor<VNode | string> = {
    onRoot(root, children) {
      return <div>{children}</div>;
    },
    onText(text: DOMHandler.Text) {
      const textValue = text.data;
      if ((props.selected === text || props.selected === text.parent) && !isBlank(textValue)) {
        return (
          <input
            value={textValue}
            onBlur={e => {
              const newText = (e.target as HTMLInputElement).value as string;
              const newNode = text.cloneNode() as DOMHandler.Text;
              newNode.data = newText;
              props.replaceNode(text, newNode);
            }}
          />
        );
      }
      return textValue;
    },
    onElement(element, children) {
      const claz = element === props.selected ? 'selected' : '';

      const onClick = (e: Event) => {
        // Relevant reading if this causes problems later: https://javascript.info/bubbling-and-capturing#stopping-bubbling
        e.stopPropagation();
        props.setSelected(element);
      };
      const innerProps = {
        class: claz,
        onClick,
        key: getId(element),
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
      // @ts-ignore
      return h(element.tagName, { ...element.attribs, ...innerProps }, children);
    },
  };
  return (
    <div class={wrapper} onClick={() => props.setSelected(undefined)}>
      <div class={content}>{visit(props.node, CanvasVisitor)}</div>
    </div>
  );
};
