import * as React from 'react';
import { render } from '@testing-library/react';
import { rest } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockRepositoriesMetadata } from './data';
import { ChakraProvider } from '@chakra-ui/react';
import { system } from 'src/theme';

export const handlers = [
  rest.get('*/metadata', (_, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockRepositoriesMetadata));
  }),
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

export function renderWithClient(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>
      <ChakraProvider value={system}>{ui}</ChakraProvider>
    </QueryClientProvider>,
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>
          <ChakraProvider value={system}>{rerenderUi}</ChakraProvider>
        </QueryClientProvider>,
      ),
  };
}

export function createWrapper() {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}
