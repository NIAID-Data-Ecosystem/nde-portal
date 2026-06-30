import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { UserDataProvider, useUserData } from './index';
import { findSavedQueryIndex } from './helpers';
import { SavedQuery } from './types';

/**
 * Regression coverage for the "Index out of range" 400 that occurred when
 * deleting multiple saved queries in a row. The favorites API deletes a saved
 * search by its array index, so a stale index (computed before a prior delete
 * shrank the list) pointed past the end of the server array. `removeSavedQuery`
 * now resolves the index by identity against the freshest list at call time, so
 * sequential deletes always send a valid index.
 *
 * In Jest, NODE_ENV is "test" (not "development"), so `useUserData` uses the real
 * `fetch` path; we mock `global.fetch` as a stateful, index-based server that
 * mirrors the production endpoint — including the 400 it returns for a bad index.
 */

const makeQuery = (query: string, total: number): SavedQuery => ({
  query,
  name: `Search: ${query}`,
  total,
  filters: {},
});

interface DeleteCall {
  index: number;
}

/**
 * Build a fetch mock backed by an in-memory `favorite_searches` array that
 * deletes by index and returns 400 "Index out of range." for an out-of-bounds
 * index — exactly like the real API.
 */
const createServerFetch = (initial: SavedQuery[]) => {
  let favorite_searches = [...initial];
  const deleteCalls: DeleteCall[] = [];

  const respond = (status: number, body: unknown) =>
    Promise.resolve({
      status,
      ok: status >= 200 && status < 300,
      text: async () => JSON.stringify(body),
    } as Response);

  const fetchMock = jest.fn(
    (url: string, init?: RequestInit): Promise<Response> => {
      const path = url.replace(/^https?:\/\/[^/]+/, '');
      const method = init?.method ?? 'GET';

      if (path === '/user/data' && method === 'GET') {
        return respond(200, { favorite_searches, favorite_datasets: [] });
      }

      if (path === '/user/data/favorites/searches' && method === 'DELETE') {
        const { index } = JSON.parse(String(init?.body)) as DeleteCall;
        deleteCalls.push({ index });
        if (index < 0 || index >= favorite_searches.length) {
          return respond(400, {
            code: 400,
            success: false,
            error: 'Index out of range.',
          });
        }
        favorite_searches = favorite_searches.filter((_, i) => i !== index);
        return respond(200, {
          message: 'removed',
          favorite_searches,
        });
      }

      return respond(404, { error: 'not found' });
    },
  );

  return {
    fetchMock,
    deleteCalls,
    getSearches: () => favorite_searches,
  };
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <UserDataProvider>{children}</UserDataProvider>
);

describe('useUserData', () => {
  beforeEach(() => {
    // Silence the hook's [favorites test] console grouping.
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('deletes multiple saved queries sequentially without an out-of-range 400', async () => {
    const queryA = makeQuery('malaria', 10);
    const queryB = makeQuery('influenza', 20);
    const server = createServerFetch([queryA, queryB]);
    global.fetch = server.fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useUserData(), { wrapper });

    // Profile loads on mount.
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(2));

    // Delete the FIRST item: it sits at index 0, the list shrinks to [influenza].
    let res: any;
    await act(async () => {
      res = await result.current.removeSavedQuery(queryA);
    });
    expect(res.status).toBe(200);
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

    // Delete the remaining item. With the old index-based code this still sent
    // the original index (1) against a length-1 array → 400. Identity resolution
    // now sends index 0.
    await act(async () => {
      res = await result.current.removeSavedQuery(queryB);
    });
    expect(res.status).toBe(200);
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(0));

    // No delete ever produced a 400, and every index sent was in range.
    const statuses = server.deleteCalls.map(c => c.index);
    expect(statuses).toEqual([0, 0]);
    expect(server.getSearches()).toHaveLength(0);
  });

  it('deletes the correct query when two share a query string but differ in filters', async () => {
    // Same `query`, different `filters` — must be treated as separate entries.
    const malariaDataset: SavedQuery = {
      query: 'malaria',
      name: 'malaria (datasets)',
      total: 5,
      filters: { '@type': ['Dataset'] },
    };
    const malariaTool: SavedQuery = {
      query: 'malaria',
      name: 'malaria (tools)',
      total: 3,
      filters: { '@type': ['ComputationalTool'] },
    };
    const server = createServerFetch([malariaDataset, malariaTool]);
    global.fetch = server.fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useUserData(), { wrapper });
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(2));

    // Remove only the Dataset variant (index 0).
    await act(async () => {
      await result.current.removeSavedQuery(malariaDataset);
    });

    expect(server.deleteCalls).toEqual([{ index: 0 }]);
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));
    // The surviving entry is the Tool variant, untouched.
    expect(result.current.savedQueries[0].filters).toEqual({
      '@type': ['ComputationalTool'],
    });
  });

  it('sets an error when a delete fails, and clears it on the next success', async () => {
    const queryA = makeQuery('malaria', 10);
    const queryB = makeQuery('influenza', 20);
    const server = createServerFetch([queryA, queryB]);
    // Force the first DELETE to fail like the real API can.
    const failingFetch = jest.fn((url: string, init?: RequestInit) => {
      const path = url.replace(/^https?:\/\/[^/]+/, '');
      if (
        path === '/user/data/favorites/searches' &&
        init?.method === 'DELETE'
      ) {
        failingFetch.mockImplementation(server.fetchMock); // subsequent calls succeed
        return Promise.resolve({
          status: 400,
          ok: false,
          text: async () =>
            JSON.stringify({
              code: 400,
              success: false,
              error: 'Bad request.',
            }),
        } as Response);
      }
      return server.fetchMock(url, init);
    });
    global.fetch = failingFetch as unknown as typeof fetch;

    const { result } = renderHook(() => useUserData(), { wrapper });
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(2));

    // Failing delete → error banner message is set.
    await act(async () => {
      await result.current.removeSavedQuery(queryA);
    });
    await waitFor(() =>
      expect(result.current.error).toBe(
        'Unable to remove this saved query. Please try again.',
      ),
    );

    // A subsequent successful delete clears the error.
    await act(async () => {
      await result.current.removeSavedQuery(queryA);
    });
    await waitFor(() => expect(result.current.error).toBeNull());
  });

  it('clearError dismisses the current error', async () => {
    const server = createServerFetch([]);
    global.fetch = server.fetchMock as unknown as typeof fetch;
    const { result } = renderHook(() => useUserData(), { wrapper });

    // Removing a dataset that doesn't exist still calls DELETE; point fetch at a
    // failing response to populate the error, then dismiss it.
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 500,
        ok: false,
        text: async () => JSON.stringify({ error: 'server error' }),
      } as Response),
    ) as unknown as typeof fetch;

    await act(async () => {
      await result.current.removeSavedDataset('does-not-exist');
    });
    await waitFor(() =>
      expect(result.current.error).toBe(
        'Unable to remove this saved resource. Please try again.',
      ),
    );

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });

  it('no-ops (no fetch) when removing a query that is not saved', async () => {
    const server = createServerFetch([makeQuery('malaria', 10)]);
    global.fetch = server.fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useUserData(), { wrapper });
    await waitFor(() => expect(result.current.savedQueries).toHaveLength(1));

    await act(async () => {
      await result.current.removeSavedQuery(makeQuery('not-saved', 0));
    });

    expect(server.deleteCalls).toHaveLength(0);
    expect(result.current.savedQueries).toHaveLength(1);
  });
});

describe('findSavedQueryIndex', () => {
  const a = makeQuery('a', 1);
  const b: SavedQuery = {
    query: 'b',
    name: 'b',
    total: 1,
    filters: { type: ['Dataset'] },
  };

  it('matches on query + structurally-equal filters regardless of key order', () => {
    expect(
      findSavedQueryIndex([a, b], {
        query: 'b',
        filters: { type: ['Dataset'] },
      }),
    ).toBe(1);
  });

  it('returns -1 when filters differ', () => {
    expect(
      findSavedQueryIndex([a, b], { query: 'b', filters: { type: ['Tool'] } }),
    ).toBe(-1);
  });
});
