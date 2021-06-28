import { Model } from '../model/EditorModel';
import { useEditor } from '../hooks/useEditor';
import { EditorView } from '../views/EditorView';

export function Editor() {
  const model: Model = useEditor('<div style="background:blue;"><span>I am content</span></div><style>:root{--sl-primary: red;} body{background: var(--sl-primary);}</style>');

  return <EditorView {...model} />;
}
