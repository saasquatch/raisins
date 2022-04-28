import { Schema } from 'prosemirror-model';
import { marks, nodes } from 'prosemirror-schema-basic';

const { doc, text, hard_break, paragraph } = nodes;
const { strong, em } = marks;

const uDOM = ['u', 0] as const;

export const DefaultProseSchema = new Schema({
  marks: {
    strong,
    em,
    underline: {
      parseDOM: [{ tag: 'u' }],
      toDOM() {
        return uDOM;
      },
    },
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
        return ['a', { href, title, target: 'top' }, 0];
      },
    },
  },
  nodes: {
    doc: {
      content: 'inline+',
    },
    text,
    hard_break,
    // paragraph,
  },
  // nodes,
});
