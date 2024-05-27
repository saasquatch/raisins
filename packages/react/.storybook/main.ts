import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [],

  // core: { builder: '@storybook/builder-vite' },
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },

  framework: '@storybook/react-vite',

  docs: {
    autodocs: true,
  },
};

export default config;
