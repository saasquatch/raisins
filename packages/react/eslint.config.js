import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    rules: {
      // We haven't ever done this, so adding it should be a follow-up project
      'react/prop-types': 'off',

      // A good practice, but the code isn't quite ready yet
      '@typescript-eslint/ban-ts-comment': 'warn',

      // We use `Function` as a type in many places. We should see if this leaks into our public API and remove it where possible
      '@typescript-eslint/ban-types': 'warn',

      // We often use `(x as any).foo` to assert that we know it's type.
      '@typescript-eslint/no-explicit-any': 'warn',

      // Lots of these are due to molecules having unused `getScope` functions. We can move away from that
      '@typescript-eslint/no-unused-vars': 'warn',

      // Many of these are in stories, so maybe we can turn this off for just stories?
      'react/jsx-key': 'warn',

      // Many of these are in stories, so maybe we can turn this off for just stories?
      'react/no-unescaped-entities': 'warn',
    },
  },
];
