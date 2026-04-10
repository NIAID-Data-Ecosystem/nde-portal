import * as React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { axe, toHaveNoViolations, JestAxeConfigureOptions } from 'jest-axe';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@chakra-ui/react';
import { theme } from 'src/theme';

expect.extend(toHaveNoViolations);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

/**
 * Renders a component with all providers and runs axe accessibility checks
 * targeting WCAG 2.1/2.2 AA compliance.
 */
export async function checkA11y(
  ui: React.ReactElement,
  axeOptions?: JestAxeConfigureOptions,
  renderOptions?: Omit<RenderOptions, 'wrapper'>,
) {
  const testQueryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </QueryClientProvider>
  );

  const { container } = render(ui, { wrapper: Wrapper, ...renderOptions });

  const results = await axe(container, {
    ...axeOptions,
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
  });

  expect(results).toHaveNoViolations();

  return results;
}

/**
 * Runs axe on an already-rendered container. Useful when the component
 * requires custom setup (mocks, state, etc.) before the a11y check.
 */
export async function checkContainerA11y(
  container: HTMLElement,
  axeOptions?: JestAxeConfigureOptions,
) {
  const results = await axe(container, {
    ...axeOptions,
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
  });

  expect(results).toHaveNoViolations();

  return results;
}
