import {
  chainCommands,
  liftEmptyBlock,
  newlineInCode,
  splitBlock,
  createParagraphNear,
  toggleMark,
} from 'prosemirror-commands';
import { keymap } from 'prosemirror-keymap';
import { EditorState, Transaction } from 'prosemirror-state';
import { inlineSchema } from './ProseSchemas';

export const NewLinePlugin = () => {
  //     let brcmd = chainCommands(
  //       newlineInCode,
  //       createParagraphNear,
  //       (state, dispatch) => {
  //         let { $from, $to } = state.selection;
  //         if (!$from.parent.isBlock) return false;
  //         if ($from.parent.type != schema.nodes.paragraph) return false;
  //         if (dispatch) {
  //           dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView());
  //         }
  //         return true;
  //       },
  //       liftEmptyBlock,
  //       splitBlock
  //     );
  //     keys['Enter'] = brcmd;
  //   }

  const cmd = (state: EditorState, dispatch?: (tr: Transaction) => void) => {
    let { $from, $to } = state.selection;
    // if (!$from.parent.isBlock) return false;
    // if ($from.parent.type != schema.nodes.paragraph) return false;
    if (dispatch) {
      const newBr = inlineSchema.node('hard_break');
      dispatch(state.tr.replaceSelectionWith(newBr).scrollIntoView());
    }
    return true;
  };

  const boldCmd = toggleMark(inlineSchema.marks.strong);
  const underlineCmd = toggleMark(inlineSchema.marks.underline);
  const emCmd = toggleMark(inlineSchema.marks.em);

  const newLineCmd = chainCommands(
    newlineInCode,
    createParagraphNear,
    cmd,
    liftEmptyBlock,
    splitBlock
  );

  return keymap({
    'Mod-b': boldCmd,
    'Mod-u': underlineCmd,
    'Mod-i': emCmd,
    [Enter]: newLineCmd,
  });
};

const Enter = 'Enter';
