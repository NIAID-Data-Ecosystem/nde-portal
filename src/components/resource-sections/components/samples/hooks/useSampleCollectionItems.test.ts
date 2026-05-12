import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react';
import {
  fetchSamplesByParentIdentifier,
  useSampleCollectionItems,
} from './useSampleCollectionItems';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Store the original value so it can be restored after tests that modify it.
const ORIGINAL_API_URL = process.env.NEXT_PUBLIC_API_URL;

// Creates a fresh QueryClient and wrapper for each test to prevent later
// tests to receive cached data from earlier ones.
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('fetchSamplesByParentIdentifier', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = ORIGINAL_API_URL;
    jest.clearAllMocks();
  });

  it('throws when NEXT_PUBLIC_API_URL is not defined', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    await expect(fetchSamplesByParentIdentifier('parent-123')).rejects.toThrow(
      'API URL is undefined',
    );
  });

  it('calls the correct endpoint with the correct query params', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { hits: [] } });

    await fetchSamplesByParentIdentifier('parent-123');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'http://localhost:3000/query',
      {
        params: {
          q: 'isBasisFor.identifier:"parent-123" AND @type:"Sample"',
          size: 1000,
        },
      },
    );
  });

  it('returns an empty array when hits is empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { hits: [] } });

    const result = await fetchSamplesByParentIdentifier('parent-123');

    expect(result).toEqual([]);
  });

  it('returns an empty array when hits is missing from the response', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: {} });

    const result = await fetchSamplesByParentIdentifier('parent-123');

    expect(result).toEqual([]);
  });

  it('returns the hits array when samples are found', async () => {
    const mockSamples = [
      { identifier: 'S1', '@type': 'Sample' },
      { identifier: 'S2', '@type': 'Sample' },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: { hits: mockSamples } });

    const result = await fetchSamplesByParentIdentifier('parent-123');

    expect(result).toEqual(mockSamples);
  });
});

describe('useSampleCollectionItems', () => {
  // Set the API URL in beforeEach rather than inside individual tests.
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_API_URL = ORIGINAL_API_URL;
  });

  it('does not fetch when enabled is false', () => {
    renderHook(() => useSampleCollectionItems('parent-123', false), {
      wrapper: createWrapper(),
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('does not fetch when parentIdentifier is undefined', () => {
    renderHook(() => useSampleCollectionItems(undefined, true), {
      wrapper: createWrapper(),
    });

    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('fetches and returns samples when enabled and parentIdentifier are provided', async () => {
    const mockSamples = [{ identifier: 'S1', '@type': 'Sample' }];
    mockedAxios.get.mockResolvedValueOnce({ data: { hits: mockSamples } });

    const { result } = renderHook(
      () => useSampleCollectionItems('parent-123', true),
      { wrapper: createWrapper() },
    );

    // Wait for the query to finish loading before asserting on the data,
    // since useQuery is asynchronous and data won't be available immediately
    // after the hook renders.
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockSamples);
  });

  it('returns isLoading true while the request is in flight', () => {
    // Never resolve so the hook stays in loading state for the duration
    // of this test.
    mockedAxios.get.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(
      () => useSampleCollectionItems('parent-123', true),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('uses the correct query key so results are cached per parentIdentifier', async () => {
    mockedAxios.get.mockResolvedValue({ data: { hits: [] } });

    // Both hooks share the same wrapper instance so they use the same
    // QueryClient. Using separate createWrapper() calls would give each hook
    // its own client with its own cache, meaning the second hook would never
    // see the result of the first hook's fetch and could time out waiting
    // to resolve.
    const wrapper = createWrapper();

    const { result: result1 } = renderHook(
      () => useSampleCollectionItems('parent-aaa', true),
      { wrapper },
    );
    const { result: result2 } = renderHook(
      () => useSampleCollectionItems('parent-bbb', true),
      { wrapper },
    );

    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    await waitFor(() => expect(result2.current.isLoading).toBe(false));

    // Each distinct parentIdentifier should trigger its own fetch since
    // they map to different query keys: ['sample-collection-items',
    // 'parent-aaa'] and ['sample-collection-items', 'parent-bbb'].
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});
