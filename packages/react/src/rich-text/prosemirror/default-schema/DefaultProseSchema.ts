import { DefaultTextMarks, HTMLComponents } from '@raisins/core';
import { CustomElement } from '@raisins/schema/schema';
import { AttributeSpec, MarkSpec, Schema } from 'prosemirror-model';
import { nodes } from 'prosemirror-schema-basic';

const { text, hard_break } = nodes;

type MarkObject = { [name in string]: MarkSpec };
type AttrObject = {
  [name: string]: AttributeSpec;
};

const MarkMap = new Map<string, CustomElement>();
(Object.keys(HTMLComponents) as (keyof typeof HTMLComponents)[]).forEach(
  (k) => {
    MarkMap.set(k, HTMLComponents[k]);
  }
);

const defaultMarkSpecs = DefaultTextMarks.filter((m) => m !== 'a').reduce(
  (marks: MarkObject, mark: string): MarkObject => {
    const component = MarkMap.get(mark);

    const attrs = component?.attributes?.reduce((attrs, attr) => {
      return {
        ...attrs,
        [attr.name]: {
          default: attr.default,
        },
      };
    }, {} as AttrObject);

    return {
      ...marks,
      [mark]: {
        attrs,
        parseDOM: [
          {
            tag: mark,
            getAttrs(dom) {
              const link = dom as HTMLElement;
              const fromDom = component?.attributes?.reduce((attrs, attr) => {
                return { ...attrs, [attr.name]: link.getAttribute(attr.name) };
              }, {} as Record<string, string | null>);
              return fromDom;
            },
          },
        ],
        toDOM(node) {
          return [mark, node.attrs, 0] as const;
        },
      },
    };
  },
  {} as MarkObject
);

export const DefaultProseSchema = new Schema({
  marks: {
    ...defaultMarkSpecs,
    link: {
      attrs: {
        href: {},
        title: { default: null },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]',
          getAttrs(dom) {
            const link = dom as HTMLAnchorElement;
            return {
              href: link.getAttribute('href'),
              title: link.getAttribute('title'),
            };
          },
        },
      ],
      toDOM(node) {
        let { href, title } = node.attrs;
        return [
          'a',
          {
            href,
            title,
            // Links will always target top
            target: 'top',
          },
          0,
        ];
      },
    },
  },
  nodes: {
    doc: {
      content: 'inline+',
    },
    text,
    hard_break,
  },
});
