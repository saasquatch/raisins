import React from 'react';

import useCanvas from './canvas/useCanvas';
import { useCore } from './hooks/useCore';
import { useEditor } from './hooks/useEditor';

export { useCanvas, useCore, useEditor };

export const Thing: React.FC = () => {
  return <div>I am a div</div>;
};
