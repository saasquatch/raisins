import React from 'react';
import {
  SelectedNodeController,
} from '../core/selection/SelectedNodeController.tsx';
import { NodeRichTextController } from './RichTextEditor.tsx';

export function SelectedNodeRichTextEditor() {
  return (
    <SelectedNodeController
      HasSelectionComponent={NodeRichTextController}
    ></SelectedNodeController>
  );
}
