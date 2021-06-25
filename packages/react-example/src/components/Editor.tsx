import { Model } from '../model/EditorModel';
import { useEditor } from '../hooks/useEditor';
import { EditorView } from '../views/EditorView';

export function Editor() {
  const model: Model = useEditor('<div>I am content</div>');

  return <EditorView {...model} />;
}
