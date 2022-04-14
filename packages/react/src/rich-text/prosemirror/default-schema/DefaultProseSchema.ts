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
