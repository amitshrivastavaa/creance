import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { version } from 'react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// Fail loudly if a run asked for one React version and got another.
if (process.env.REACT && !version.startsWith(`${process.env.REACT}.`)) throw new Error(`Expected React ${process.env.REACT}, running ${version}`);

// jsdom has no layout, so no ResizeObserver; Radix Slider and Scroll Area need one to mount.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
