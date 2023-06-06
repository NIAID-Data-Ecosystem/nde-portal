import { rest } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from './mocks/utils.tsx';
import { useRepoData } from 'src/hooks/api';
import { server } from '../../jest.setup.js';

describe('use query hook', () => {
  test('successful useRepoData query hook', async () => {
    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          identifier: 'LINCS',
          url: 'https://lincsportal.ccs.miami.edu/',
          label: 'BD2K-LINCS DCIC',
          type: 'generalist',
          icon: '/assets/resources/lincs-icon.jpg',
          abstract:
            'Catalogs changes in gene expression and other cellular processes',
        }),
      ]),
    );
  });

  test('failure query hook', async () => {
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
  });
});
