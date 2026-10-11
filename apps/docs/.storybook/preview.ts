import type { Preview } from '@storybook/react-vite';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { addons } from 'storybook/preview-api';
import '@creance-ui/tokens/tokens.css';
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
    transparency: {
      description: 'Glass, or solid surfaces as with prefers-reduced-transparency',
      toolbar: {
        title: 'Surfaces',
        icon: 'transfer',
        items: [
          { value: 'glass', title: 'Glass' },
          { value: 'reduce', title: 'Solid (reduced transparency)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'system', transparency: 'glass' },
  parameters: {
    options: {
      storySort: { order: ['Introduction', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates'] },
    },
    a11y: { test: 'error' },
  },
};

// Listen on the channel rather than in a decorator: decorators don't run on MDX docs pages.
function applyTheme({ globals }: { globals: { theme?: string; transparency?: string } }) {
  const root = document.documentElement;
  if (!globals.theme || globals.theme === 'system') delete root.dataset.theme;
  else root.dataset.theme = globals.theme;
  if (globals.transparency === 'reduce') root.dataset.transparency = 'reduce';
  else delete root.dataset.transparency;
}
// axe can't measure contrast through backdrop blur or background gradients: it reports those
// as "incomplete", which would silently pass. Story tests therefore render glass without blur
// and without the canvas gradient, keeping the translucency, which axe does blend.
if (import.meta.env.MODE === "test") document.documentElement.dataset.a11yTest = '';

addons.getChannel().on(SET_GLOBALS, applyTheme);
addons.getChannel().on(GLOBALS_UPDATED, applyTheme);

export default preview;
