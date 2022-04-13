import { Meta } from '@storybook/react';
import React from 'react';
import { PackageEditorController } from './PackageEditorController';

const meta: Meta = {
  title: 'Metamodel',
  component: PackageEditorController,
};
export default meta;

export function PackageEditor() {
  return <PackageEditorController />;
}
