import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const src = (path: string) => fileURLToPath(new URL(`../../../packages/react/src/${path}`, import.meta.url));

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: '@storybook/react-vite',
  core: { disableTelemetry: true },
  // Stories run against the kit's source, so edits show up without a package rebuild.
  viteFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        { find: /^creance\/simulator$/, replacement: src('simulator/index.ts') },
        { find: /^creance$/, replacement: src('index.ts') },
      ],
    },
  }),
};

export default config;
