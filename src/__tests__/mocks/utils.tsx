import * as React from 'react';
import { render } from '@testing-library/react';
import { rest } from 'msw';
import { QueryClient, QueryClientProvider } from 'react-query';
import { mockRepositoriesMetadata } from './data';
import { theme, ThemeProvider } from 'nde-design-system';

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

//  wrap test component render with Apollo's QueryClientProvider and chakra-ui's ThemeProvider
export function renderWithClient(ui: React.ReactElement, props?: any) {
  const testQueryClient = createTestQueryClient();
  const { rerender, ...result } = render(
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>{ui}</ThemeProvider>
    </QueryClientProvider>,
    props,
  );
  return {
    ...result,
    rerender: (rerenderUi: React.ReactElement) =>
      rerender(
        <QueryClientProvider client={testQueryClient}>
          <ThemeProvider theme={theme}>{rerenderUi}</ThemeProvider>
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

// Mock local storage
interface LocalStorageMockInterface {
  store: { [key: string]: string };
  clear: () => void;
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

export const localStorageMock: LocalStorageMockInterface = {
  store: {},
  clear: function () {
    this.store = {};
  },
  getItem: function (key) {
    return this.store[key] || null;
  },
  setItem: function (key, value) {
    this.store[key] = String(value);
  },
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
