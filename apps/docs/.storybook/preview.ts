import type { Preview } from '@storybook/react-vite';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import 'creance-tokens/tokens.css';
import '../src/docs.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'system', title: 'System' },
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'system' },
  parameters: {
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates'] },
    },
    a11y: { test: 'error' },
  },
};

// Listen on the channel rather than in a decorator: decorators don't run on MDX docs pages.
function applyTheme({ globals }: { globals: { theme?: string } }) {
  const root = document.documentElement;
  if (!globals.theme || globals.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = globals.theme;
}
addons.getChannel().on(SET_GLOBALS, applyTheme);
addons.getChannel().on(GLOBALS_UPDATED, applyTheme);

export default preview;
