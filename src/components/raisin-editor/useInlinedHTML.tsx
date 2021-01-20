import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Node } from 'domhandler';
import serialize from 'dom-serializer';

type Editor = any;

const elementToEditor = new WeakMap<HTMLElement, Editor>();

export function useInlinedHTML({ setNode }) {
  function useInlineHTMLEditorRef(element: HTMLElement, node: Node) {
    // Ignore null refs
    if (!element) return;

    // Don't re-initialize elements
    if (elementToEditor.has(element)) return;

    elementToEditor.set(element, {});
    ClassicEditor.create(element)
      .then(editor => {
        elementToEditor.set(element, editor);
        console.log(editor);
        editor.setData(serialize(node));
      })
      .catch(error => {
        console.error(error);
      });
  }

  return { useInlineHTMLEditorRef };
}
