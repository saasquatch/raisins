import {
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode,
  splitBlock,
  toggleMark,
} from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { DefaultProseSchema } from './DefaultProseSchema';

const cmd = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  let { $from, $to } = state.selection;
  // if (!$from.parent.isBlock) return false;
  // if ($from.parent.type != schema.nodes.paragraph) return false;
  if (dispatch) {
    const newBr = DefaultProseSchema.node('hard_break');
    dispatch(state.tr.replaceSelectionWith(newBr).scrollIntoView());
  }
  return true;
};

const boldCmd = toggleMark(DefaultProseSchema.marks.strong);
const underlineCmd = toggleMark(DefaultProseSchema.marks.underline);
const emCmd = toggleMark(DefaultProseSchema.marks.em);

const newLineCmd = chainCommands(
  newlineInCode,
  createParagraphNear,
  cmd,
  liftEmptyBlock,
  splitBlock
);

const Enter = 'Enter';

/**
 * A ProseMirror {@link Plugin} for hotkeys that modify the default schema
 *
 * @returns
 */
export const DefaultProseSchemaHotkeysPlugin: Plugin = keymap({
  'Mod-b': boldCmd,
  'Mod-u': underlineCmd,
  'Mod-i': emCmd,
  [Enter]: newLineCmd,
});
