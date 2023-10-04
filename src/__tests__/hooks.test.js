import { rest } from 'msw';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from './mocks/utils.tsx';
import { useRepoData } from 'src/hooks/api';
import { server } from '../../jest.setup.js';
import RepositoryData from 'configs/repositories.json';

describe('use query hook', () => {
  test('successful useRepoData query hook', async () => {
    const { result } = renderHook(() => useRepoData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const repos = RepositoryData.repositories.filter(
      ({ type }) => type === 'generalist',
    );

    const { identifier } = result.current.data[0];
    const { type, icon, abstract } = repos.find(({ id }) => identifier === id);
    expect(result.current.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type,
          icon,
          abstract,
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
