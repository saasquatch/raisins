import { dirname, join } from "path";
module.exports = {
  stories: ['../**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [],

  // core: { builder: '@storybook/builder-vite' },
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {}
  },

  docs: {
    autodocs: true
  }
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
