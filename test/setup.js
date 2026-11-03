import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom doesn't implement media playback
Object.defineProperties(window.HTMLMediaElement.prototype, {
  play: {
    configurable: true,
    value: vi.fn(function play() {
      this.dispatchEvent(new Event('play'));
      return Promise.resolve();
    }),
  },
  pause: {
    configurable: true,
    value: vi.fn(function pause() {
      this.dispatchEvent(new Event('pause'));
    }),
  },
  load: {
    configurable: true,
    value: vi.fn(),
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
