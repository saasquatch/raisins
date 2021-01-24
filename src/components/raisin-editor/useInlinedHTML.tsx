import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import serialize from 'dom-serializer';
import { RaisinNode } from '../../model/RaisinNode';

type Editor = any;

const elementToEditor = new WeakMap<HTMLElement, Editor>();

export function useInlinedHTML({ setNode }) {
  function useInlineHTMLEditorRef(element: HTMLElement, node: RaisinNode) {
    // Ignore null refs
    if (!element) return;

    // Don't re-initialize elements
    if (elementToEditor.has(element)) return;

    elementToEditor.set(element, {});

    // TODO: New serialize

    //   ClassicEditor.create(element)
    //     .then(editor => {
    //       elementToEditor.set(element, editor);
    //       console.log(editor);
    //       editor.setData(serialize(node));
    //     })
    //     .catch(error => {
    //       console.error(error);
    //     });
  }

  return { useInlineHTMLEditorRef };
}
