import { renderHook, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { useMetadata } from 'src/hooks/api/useMetadata.tsx';

import { server } from '../../jest.setup.js';
import { mockRepositoriesMetadata } from './mocks/data';
import { createWrapper } from './mocks/utils.tsx';

describe('use query hook', () => {
  test('successful useMetadata query hook', async () => {
    const { result } = renderHook(() => useMetadata(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 5000,
    });

    // useMetadata returns the raw `/metadata` response served by the msw handler.
    expect(result.current.data).toEqual(mockRepositoriesMetadata);
  });

  test('failure query hook', async () => {
    // Mock console.error before the test
    const originalConsoleError = console.error;
    console.error = jest.fn();

    server.use(
      rest.get('*', (_, res, ctx) => {
        return res(ctx.status(500));
      }),
    );

    const { result } = renderHook(() => useMetadata(), {
      wrapper: createWrapper(),
    });
    // fetchMetadata retries 5xx responses with exponential backoff
    // (300 + 600 + 1200ms), so allow more than the default 1000ms timeout.
    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });

    expect(result.current.error).toBeDefined();
    console.error = originalConsoleError;
  });
});
