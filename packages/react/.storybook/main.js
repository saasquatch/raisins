module.exports = {
  stories: ['../**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [],
  // core: { builder: '@storybook/builder-vite' },
  // https://storybook.js.org/docs/react/configure/typescript#mainjs-configuration
  typescript: {
    check: true, // type-check stories during Storybook build
  },
};
