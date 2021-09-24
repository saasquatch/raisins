import React from 'react';

import useCanvas from './hooks/useCanvas';
import { useComponentModel } from './hooks/useComponentModel';
import { useCore } from './hooks/useCore';
import { useEditor } from './hooks/useEditor';

export { useCanvas, useComponentModel, useCore, useEditor };
export const Thing: React.FC = () => {
  return <div>I am a div</div>;
};
