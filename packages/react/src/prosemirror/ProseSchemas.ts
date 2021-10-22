import { schema, marks, nodes } from 'prosemirror-schema-basic';
import { Schema } from 'prosemirror-model';

const { doc, text, hard_break, paragraph } = nodes;

export const inlineSchema = new Schema({
  marks,
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
