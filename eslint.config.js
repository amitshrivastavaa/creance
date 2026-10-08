import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['**/dist', '**/storybook-static', '**/node_modules', '.playwright-mcp'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // Native autofocus stays banned; components like ApprovalPrompt manage focus deliberately.
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
    },
  },
);
