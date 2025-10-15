import {
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  newlineInCode,
  splitBlock,
  toggleMark,
} from 'prosemirror-commands';
import {} from 'prosemirror-transform';
import { keymap } from 'prosemirror-keymap';
import { Command, EditorState, Plugin, Transaction } from 'prosemirror-state';
import { DefaultProseSchema } from './DefaultProseSchema';

const cmd = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
  // const { $from, $to } = state.selection;
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

export const PromptForHref: Command = (state, dispatch) => {
  const href = window.prompt('What url?');
  const toggleLink = toggleMark(DefaultProseSchema.marks.link, { href });
  return toggleLink(state, dispatch);
};

/**
 * A ProseMirror {@link Plugin} for hotkeys that modify the default schema
 *
 * @returns
 */
export const DefaultProseSchemaHotkeysPlugin: Plugin = keymap({
  'Mod-b': boldCmd,
  'Mod-u': underlineCmd,
  'Mod-i': emCmd,
  'Mod-k': PromptForHref,
  [Enter]: newLineCmd,
});
