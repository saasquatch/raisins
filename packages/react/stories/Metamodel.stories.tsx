import React from 'react';
import { Meta, Story } from '@storybook/react';
import { useComponentModel } from '../src/hooks/useComponentModel';
import { PackageEditorView } from '../src/views/PackageEditorView';

const meta: Meta = {
  title: 'Metamodel',
  component: PackageEditor,
};
export default meta;

export function PackageEditor() {
  return <PackageEditorView {...useComponentModel()} />;
}
