import {
  cleanup,
} from '@testing-library/react';

import {
  afterEach,
} from 'vitest';

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

Object.defineProperty(
  window,
  'matchMedia',
  {
    configurable: true,
    writable: true,

    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,

      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},

      dispatchEvent() {
        return false;
      },
    }),
  },
);
