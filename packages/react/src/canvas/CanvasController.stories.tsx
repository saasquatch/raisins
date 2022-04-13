import React from 'react';
import { example } from '../node/children/LoadTest.example';
import { BasicStory } from '../index.stories';
import { big, MintComponents, mintMono } from '../examples/MintComponents';
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

export const BigCanvasOnly = () => (
  <BasicStory startingHtml={big}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
    </div>
  </BasicStory>
);
export const MintCanvasOnly = () => (
  <BasicStory startingHtml={mintMono} startingPackages={MintComponents}>
    <div style={{ display: 'flex' }}>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
      <div style={{ width: '50%' }}>
        <CanvasController />
      </div>
    </div>
  </BasicStory>
);
