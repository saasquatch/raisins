import { Model } from '../../model/Dom';
import { RaisinElementNode, RaisinNode } from '../../model/RaisinNode';

interface ComponentEditor<T = unknown> {
  mount(element: HTMLElement, value: RaisinElementNode, model: Model): Promise<T>;
  unmount(instance: T): void;
  setValue(value: RaisinElementNode): void;
}

declare const JSONEditor: any;

class ClassJSONEditor implements ComponentEditor {
  editing: RaisinElementNode;
  model: Model;
  editor: any;

  mount(element: HTMLElement, value: RaisinElementNode, model: Model) {
    this.editing = value;
    this.model = model;

    const schema = model.getComponentMeta(value).attributes;

    const editor = new JSONEditor(element, {
      schema,
    });
    this.editor = editor;

    editor.setValue(value.attribs);
    editor.on('change', () => {
      // Do something
      this.onChange();
    });

    return editor;
  }

  onChange() {
    const newAttributes = this.editor.getValue();
    const newNode = {
      ...this.editing,
      attr: newAttributes,
    };
    this.model.replaceNode(this.editing, newNode);
  }
  unmount(instance: any) {
    instance.destroy();
  }
  setValue(value: RaisinElementNode) {
    this.editing = value;
  }
}

new ClassJSONEditor();
