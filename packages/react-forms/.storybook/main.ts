/** @type { import('@storybook/react-vite').StorybookConfig } */
import type { StorybookConfig } from '@storybook/react-vite';
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['./public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-styling',
  ],
  async viteFinal(config) {
    const newConfig = {
      ...config,
      optimizeDeps: {
        include: ['@hubfx/core', '@hubfx/forms'],
      },
    };

    if (newConfig.build) {
      newConfig.build.commonjsOptions = {
        include: [/hubfx/, /node_modules/],
      };
    }

    return newConfig;
  },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};
export default config;
