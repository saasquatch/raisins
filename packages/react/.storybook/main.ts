import { dirname, join } from 'path';
import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [],

  // core: { builder: '@storybook/builder-vite' },
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },

  framework: getAbsolutePath('@storybook/react-vite'),

  docs: {},
};

export default config;

// Required due to Storybook bug: https://storybook.js.org/docs/faq#how-do-i-fix-module-resolution-in-special-environments
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')));
}
