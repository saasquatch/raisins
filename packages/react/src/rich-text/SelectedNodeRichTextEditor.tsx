import React from 'react';
import { SelectedNodeController } from '../core/selection/SelectedNodeController';
import { NodeRichTextController } from './RichTextEditor';

export function SelectedNodeRichTextEditor() {
  return (
    <SelectedNodeController
      HasSelectionComponent={NodeRichTextController}
    ></SelectedNodeController>
  );
}
