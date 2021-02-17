type Editor = any;

const elementToEditor = new WeakMap<HTMLElement, Editor>();

export function useInlinedHTML({}) {
  function useInlineHTMLEditorRef(element: HTMLElement) {
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
