import { Component, h } from '@stencil/core';
import { Model } from '../../model/EditorModel';
import { useHost, withHooks } from '@saasquatch/stencil-hooks';
import { useEditor } from '../../hooks/useEditor';
import { EditorView } from '../../views/EditorView';

@Component({
  tag: 'raisin-editor',
})
export class Editor {
  constructor() {
    withHooks(this);
  }

  disconnectedCallback() {}

  render() {
    const host = useHost();
    const model: Model = useEditor(host);

    return <EditorView {...model} />;
  }
}

