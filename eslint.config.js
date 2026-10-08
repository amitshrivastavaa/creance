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
  // Atomic Design: imports only point down a level, and components never import the event model.
  ...[
    ['atoms', ['molecules', 'organisms', 'templates']],
    ['molecules', ['organisms', 'templates']],
    ['organisms', ['templates']],
    ['templates', []],
  ].map(([level, above]) => ({
    files: [`packages/react/src/${level}/**/*.{ts,tsx}`],
    ignores: ['**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            ...above.map((l) => ({ group: [`**/${l}/**`], message: `${level} must not import from ${l}: imports point down a level.` })),
            { group: ['**/events', '**/run', '**/run/**', '**/simulator/**'], message: 'Components take plain props; only run/ and apps use the event model.' },
          ],
        },
      ],
    },
  })),
);
