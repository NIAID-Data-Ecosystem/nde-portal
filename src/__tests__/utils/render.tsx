import { ChakraProvider } from '@chakra-ui/react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import React from 'react';
import { system } from 'src/theme';

/*
Chakra v3 resolves every recipe through context, so a bare RTL `render` of any
styled component throws "useContext returned `undefined`". v2 silently fell back
to defaults, which is why these tests only started failing after the upgrade.

Re-exporting RTL with a wrapped `render` means a test file only has to change
its import path, not its call sites.
*/
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider value={system}>{children}</ChakraProvider>
);

const render = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => rtlRender(ui, { wrapper: Wrapper, ...options });

export * from '@testing-library/react';
export { render };
