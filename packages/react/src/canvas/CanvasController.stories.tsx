import React from 'react';
import { example } from '../node/children/ChildrenEditor.example';
import { BasicStory } from '../views/Editor.stories';
import { CanvasController } from './CanvasController';

export default {
  title: 'Canvas Controller',
};

export const LoadTest = () => {
  return (
    <BasicStory startingHtml={example}>
      <CanvasController />
    </BasicStory>
  );
};
