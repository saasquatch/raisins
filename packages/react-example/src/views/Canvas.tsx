import { css } from '@emotion/css';
import { cssSerializer, htmlSerializer, htmlUtil, RaisinElementNode, RaisinStyleNode, RaisinNodeVisitor as NodeVisitor } from '@raisins/core';
import { Model } from '../model/EditorModel';
import SlButtonGroup from '@shoelace-style/react/dist/button-group';
import SlDropdown from '@shoelace-style/react/dist/dropdown';
import SlIcon from '@shoelace-style/react/dist/icon';
import SlMenu from '@shoelace-style/react/dist/menu';
import SlMenuItem from '@shoelace-style/react/dist/menu-item';
import SlMenuLabel from '@shoelace-style/react/dist/menu-label';
import classNames from 'classnames';
import React, { FC, MouseEventHandler, ReactNode } from 'react';
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

const SelectedToolbar = css`
  background: red;
  color: white;
  display: flex;
  padding: 4px;

  flex-wrap: wrap;
  sl-button-group {
    justify-self: end;
  }
  // CSS from: https://shoelace.style/components/button-group?id=toolbar-example
  sl-button-group:not(:last-of-type) {
    margin-right: var(--sl-spacing-x-small);
  }
`;
const SelectedTitle = css`
  line-height: 28px;
  flex-grow: 1;
`;

const Selectable = css`
  position: relative;
  &:hover {
    outline: 1px solid #ccc;
  }
  // &:hover::before {
  //   content: attr(data-tagname);
  //   position: absolute;
  //   color: #fff;
  //   background: blue;
  //   top: -20px;
  //   height: 20px;
  //   z-index: 9;
  // }
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
      // const parent = props.parents.get(text);
      // if ((props.selected === text || props.selected === parent) && props.mode === 'edit') {
      //   return (
      //     <input
      //       value={textValue}
      //       onInput={e => {
      //         const newText = (e.target as HTMLInputElement).value as string;
      //         const newNode = {
      //           ...text,
      //           data: newText,
      //         };
      //         props.replaceNode(text, newNode);
      //       }}
      //     />
      //   );
      //   // return <div ref={e => props.useInlineHTMLEditorRef(e, text)} />;
      // }
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
      const onClick: MouseEventHandler<Element> = e => {
        // Relevant reading if this causes problems later: https://javascript.info/bubbling-and-capturing#stopping-bubbling
        e.stopPropagation();
        props.setSelected(element);
      };

      const innerProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> = {
        // 'data-rjs-selected': element === props.selected,
        // 'data-tagname': element.tagName,
        className: classNames({
          [Selectable]: props.mode === 'edit',
          [element.attribs.class]: true,
        }),
        onClick: props.mode === 'edit' ? onClick : () => {},
        ref: (el: HTMLElement | null) => props.registerRef(element, el as HTMLElement),
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
            <textarea>{htmlSerializer(element.children)}</textarea>
          </div>
        );
      }
      const { style, ...rest } = element.attribs;
      const styleObj = styleToObject(style);

      let p = { style: styleObj, ...rest, ...innerProps, children };
      return (
        <HTMLCompont as={element.tagName} inner={p} />
      );
    },
  };

  const selectedAncestry = props.selected && props.getAncestry(props.selected).reverse();
  const hasSelectedAncestry = props.selected && selectedAncestry && selectedAncestry.length > 1 ? true : false;
  const hasSelected = typeof props.selected !== 'undefined';
  const ContentComponent: FC = () => {
    return <>{visit(props.node, CanvasVisitor)}</>;
  };

  props.renderInIframe(ContentComponent);
  
  return (
    <div>
      <div className={wrapper} onClick={() => props.setSelected(undefined as any)}>
        <div className={content} data-content style={{ width: props.size.width }} ref={el => (props.containerRef.current = el!)}>
        </div>
      </div>
      <div
        ref={el => (props.toolbarRef.current = el!)}
        data-toolbar
        {...props.toolbarPopper.attributes.popper}
        // @ts-ignore
        style={props.toolbarPopper.styles.popper}
      >
        {hasSelected && (
          <div className={SelectedToolbar}>
            <div className={SelectedTitle}>{props.getComponentMeta(props.selected as RaisinElementNode)?.title || props.selected?.nodeType}</div>
            <SlButtonGroup>
              <button
                onClick={() => {
                  props.duplicateNode(props.selected!);
                }}
              >
                <SlIcon name="files"></SlIcon>
              </button>
              <button onClick={() => props.removeNode(props.selected!)}>
                <SlIcon name="trash"></SlIcon>
              </button>
              <button onClick={() => props.moveUp(props.selected!)}>
                {' '}
                <SlIcon name="arrow-bar-up"></SlIcon>
              </button>
              <button onClick={() => props.moveDown(props.selected!)}>
                {' '}
                <SlIcon name="arrow-bar-down"></SlIcon>
              </button>
            </SlButtonGroup>{' '}
            {selectedAncestry && (
              <SlButtonGroup>
                <SlDropdown placement="top-end">
                  <button slot="trigger">
                    <SlIcon name="bar-chart-steps"></SlIcon>
                  </button>
                  <SlMenu>
                    <SlMenuLabel>Select Parent</SlMenuLabel>

                    {selectedAncestry.map((n, idx) => {
                      const meta = props.getComponentMeta(n as any);
                      return (
                        <SlMenuItem>
                          <span onClick={() => props.setSelected(n)}>
                            {'-'.repeat(idx)} {meta?.title || 'Root'}
                          </span>
                        </SlMenuItem>
                      );
                    })}
                    <SlMenuItem>
                      {'-'.repeat(selectedAncestry.length)} <b>{props.getComponentMeta(props.selected as RaisinElementNode).title}</b>
                    </SlMenuItem>
                  </SlMenu>
                </SlDropdown>
              </SlButtonGroup>
            )}
          </div>
        )}
      </div>

      {hasSelected && <div>Selected</div>}
    </div>
  );
};

const HTMLCompont: FC<{ as: string; inner: Record<any, any> }> = props => {
  // TODO: React render raw
  return React.createElement(props.as, props.inner);
};
