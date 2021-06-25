import { Model } from '../model/EditorModel';
import { useEditor } from '../hooks/useEditor';
import { EditorView } from '../views/EditorView';

export function Editor() {
  const model: Model = useEditor('<div style="background:blue;"><span>I am content</span></div>');

  return <EditorView {...model} />;
}
