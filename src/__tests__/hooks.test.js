import { rest } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from './mocks/utils.tsx';
import { useRepoData } from 'src/hooks/api/useRepoData.ts';
import { server } from '../../jest.setup.js';

describe('use query hook', () => {
  test('successful useRepoData query hook', async () => {
    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const { _id, abstract, conditionsOfAccess, name, type, url, domain } =
      result.current.data[0];

    expect(result.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id,
          abstract,
          type,
          name: name || '',
          domain,
          url,
          conditionsOfAccess: conditionsOfAccess || '',
        }),
      ]),
    );
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

    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    console.error = originalConsoleError;
  });
});
