import { useCallback, useEffect, useRef, useState } from 'react';

export type UserPreferences = {
  ai_toggle_preference: boolean;
  beta: boolean;
  contact_preference: boolean;
  feedback_preference: boolean;
};

export type UserPreferencesKeys = keyof UserPreferences;

export type FavoriteSearch = {
  query: string;
  name: string;
  saved_at?: string;
};

export type FavoriteDataset = {
  dataset_id: string;
  name: string;
  saved_at?: string;
};

/**
 * Mock favorite datasets used to populate the user's saved resources in
 * development mode.
 */
export const MOCK_FAVORITE_DATASETS: FavoriteDataset[] = [
  {
    dataset_id: 'figshare_25077557',
    name: 'S1 Data -',
    saved_at: '2026-05-28T20:52:16.015Z',
  },
  {
    dataset_id: 'biotools_123fastq',
    name: '123FASTQ',
    saved_at: '2026-05-21T20:52:22.978Z',
  },
  {
    dataset_id: 'figshare_25077596',
    name: 'Descriptive statistics and correlation matrix.',
    saved_at: '2026-05-27T20:52:16.714Z',
  },
  {
    dataset_id: 'figshare_25077600',
    name: 'Summary of the distribution, host plants and molecular data for the non-native psyllid taxa of the central Macaronesian islands.',
    saved_at: '2026-05-23T20:52:20.978Z',
  },
  {
    dataset_id: 'figshare_25077606',
    name: 'Primer combinations used to amplify cox1 with reference, sequence, annealing temperature, and amplicon length.',
    saved_at: '2026-05-22T20:52:21.978Z',
  },
  {
    dataset_id: 'figshare_25077693',
    name: 'Institutional-level dispositions limiting glaucoma care.',
    saved_at: '2026-05-21T20:52:22.978Z',
  },
];

export type UserProfile = UserPreferences & {
  username: string;
  oauth_provider: string;
  linked_accounts: string[];
  favorite_searches: FavoriteSearch[];
  favorite_datasets: FavoriteDataset[];
  created: string;
  updated: string;
  name: string;
  email: string;
};

const DEFAULT_PREFERENCES: UserPreferences = {
  ai_toggle_preference: false,
  beta: true,
  contact_preference: false,
  feedback_preference: false,
};

const DEFAULT_MOCK_PROFILE: UserProfile = {
  username: process.env.NEXT_PUBLIC_MOCK_AUTH_USERNAME || 'mockuser',
  oauth_provider: process.env.NEXT_PUBLIC_MOCK_AUTH_PROVIDER || 'github',
  linked_accounts: [],
  ai_toggle_preference: false,
  favorite_searches: [],
  favorite_datasets: MOCK_FAVORITE_DATASETS,
  name: process.env.NEXT_PUBLIC_MOCK_AUTH_NAME || 'Mock User',
  email: process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL || 'user@email.com',
  beta: true,
  contact_preference: false,
  feedback_preference: false,
  created: '2026-03-11T19:36:34+00:00',
  updated: '2026-03-11T20:24:13+00:00',
};

type ApiResult = { status: number; ok: boolean; body: unknown };

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.data.niaid.nih.gov/v1';
const API_BASE_URL = apiUrl.replace(/\/v1$/, '');
const isDevMode = process.env.NODE_ENV === 'development';

export function useUserData() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [favoriteSearches, setFavoriteSearches] = useState<FavoriteSearch[]>(
    [],
  );

  const [favoriteDatasets, setFavoriteDatasets] = useState<FavoriteDataset[]>(
    [],
  );

  const mockUserDataRef = useRef<{ profile: UserProfile }>({
    // Clone the arrays so the mock API's push/filter operations don't mutate
    // the shared DEFAULT_MOCK_PROFILE / MOCK_FAVORITE_DATASETS constants.
    profile: {
      ...DEFAULT_MOCK_PROFILE,
      favorite_searches: [...DEFAULT_MOCK_PROFILE.favorite_searches],
      favorite_datasets: [...DEFAULT_MOCK_PROFILE.favorite_datasets],
    },
  });

  const logApiResult = useCallback(
    (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      result: ApiResult,
    ) => {
      console.group(`[favorites test] ${method} ${path}`);
      console.log('status', result.status);
      console.log('ok', result.ok);
      console.log('body', result.body);
      if (isDevMode) {
        console.log('mode', 'mock-dev');
      }
      console.groupEnd();
    },
    [],
  );

  const callMockUserDataApi = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: unknown,
    ) => {
      const store = mockUserDataRef.current;
      let result: ApiResult = {
        status: 404,
        ok: false,
        body: { error: 'Mock route not found' },
      };

      if (path === '/user/data' && method === 'GET') {
        result = { status: 200, ok: true, body: store.profile };
      } else if (path === '/user/data' && method === 'PUT') {
        const now = new Date().toISOString();
        store.profile = {
          ...store.profile,
          ...(body as Partial<UserPreferences>),
          updated: now,
        };
        result = {
          status: 200,
          ok: true,
          body: { message: 'Mock preferences updated', ...store.profile },
        };
      } else if (
        path === '/user/data/favorites/searches' &&
        method === 'POST'
      ) {
        const now = new Date().toISOString();
        const payload = body as FavoriteSearch;
        store.profile.favorite_searches.push({
          query: payload.query,
          name: payload.name,
          saved_at: now,
        });
        store.profile.updated = now;
        result = {
          status: 200,
          ok: true,
          body: {
            message: 'Mock favorite search saved',
            favorite_searches: store.profile.favorite_searches,
          },
        };
      } else if (
        path === '/user/data/favorites/searches' &&
        method === 'DELETE'
      ) {
        const now = new Date().toISOString();
        const payload = body as { index: number };
        if (typeof payload?.index === 'number' && payload.index >= 0) {
          store.profile.favorite_searches.splice(payload.index, 1);
          store.profile.updated = now;
          result = {
            status: 200,
            ok: true,
            body: {
              message: 'Mock favorite search removed',
              favorite_searches: store.profile.favorite_searches,
            },
          };
        } else {
          result = {
            status: 400,
            ok: false,
            body: { error: 'Invalid index' },
          };
        }
      } else if (
        path === '/user/data/favorites/datasets' &&
        method === 'POST'
      ) {
        const now = new Date().toISOString();
        const payload = body as FavoriteDataset;
        store.profile.favorite_datasets.push({
          dataset_id: payload.dataset_id,
          name: payload.name,
          saved_at: now,
        });
        store.profile.updated = now;
        result = {
          status: 200,
          ok: true,
          body: {
            message: 'Mock favorite dataset saved',
            favorite_datasets: store.profile.favorite_datasets,
          },
        };
      } else if (
        path === '/user/data/favorites/datasets' &&
        method === 'DELETE'
      ) {
        const now = new Date().toISOString();
        const payload = body as { dataset_id: string };
        store.profile.favorite_datasets =
          store.profile.favorite_datasets.filter(
            dataset => dataset.dataset_id !== payload?.dataset_id,
          );
        store.profile.updated = now;
        result = {
          status: 200,
          ok: true,
          body: {
            message: 'Mock favorite dataset removed',
            favorite_datasets: store.profile.favorite_datasets,
          },
        };
      }

      isDevMode && logApiResult(method, path, result);
      return result;
    },
    [logApiResult],
  );

  const callUserDataApi = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: unknown,
    ) => {
      if (isDevMode) {
        return callMockUserDataApi(method, path, body);
      }

      const url = `${API_BASE_URL}${path}`;

      try {
        const response = await fetch(url, {
          method,
          credentials: 'include',
          headers: body ? { 'Content-Type': 'application/json' } : undefined,
          body: body ? JSON.stringify(body) : undefined,
        });

        const rawText = await response.text();
        let parsedBody: unknown = rawText;

        if (rawText) {
          try {
            parsedBody = JSON.parse(rawText);
          } catch {
            // Keep raw text when payload is not valid JSON.
          }
        }

        const result = {
          status: response.status,
          ok: response.ok,
          body: parsedBody,
        };
        logApiResult(method, path, result);
        return result;
      } catch (error) {
        console.group(`[favorites test] ${method} ${path}`);
        console.error('request failed', error);
        console.groupEnd();
        return { ok: false, error };
      }
    },
    [callMockUserDataApi, logApiResult],
  );

  const getProfile = useCallback(async () => {
    const result = await callUserDataApi('GET', '/user/data');
    if (result && 'body' in result && result.ok && result.body) {
      const profile = result.body as Partial<UserProfile>;
      const keys: (keyof UserProfile)[] = [
        'ai_toggle_preference',
        'beta',
        'contact_preference',
        'feedback_preference',
      ];
      const updates = Object.fromEntries(
        keys
          .filter(key => profile[key] !== undefined)
          .map(key => [key, profile[key]]),
      ) as Partial<UserProfile>;

      setPreferences(prev => ({
        ...prev,
        ...updates,
      }));

      if (Array.isArray(profile.favorite_searches)) {
        setFavoriteSearches(profile.favorite_searches);
      }
      if (Array.isArray(profile.favorite_datasets)) {
        setFavoriteDatasets(profile.favorite_datasets);
      }
    }
    return result;
  }, [callUserDataApi]);

  // Fetch preferences on mount
  useEffect(() => {
    void getProfile();
  }, [getProfile]);

  const updatePreferenceField = useCallback(
    (field: UserPreferencesKeys) => {
      const nextPreferences = {
        ...preferences,
        [field]: !preferences[field],
      };

      setPreferences(nextPreferences);
      void callUserDataApi('PUT', '/user/data', nextPreferences);
    },
    [callUserDataApi, preferences],
  );

  const saveFavoriteSearch = useCallback(
    async (search: FavoriteSearch) => {
      const result = await callUserDataApi(
        'POST',
        '/user/data/favorites/searches',
        search,
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_searches?: FavoriteSearch[] };
        if (Array.isArray(body.favorite_searches)) {
          setFavoriteSearches(body.favorite_searches);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const removeFavoriteSearch = useCallback(
    async (index: number) => {
      const result = await callUserDataApi(
        'DELETE',
        '/user/data/favorites/searches',
        { index },
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_searches?: FavoriteSearch[] };
        if (Array.isArray(body.favorite_searches)) {
          setFavoriteSearches(body.favorite_searches);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const saveFavoriteDataset = useCallback(
    async (dataset: FavoriteDataset) => {
      const result = await callUserDataApi(
        'POST',
        '/user/data/favorites/datasets',
        dataset,
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_datasets?: FavoriteDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setFavoriteDatasets(body.favorite_datasets);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const removeFavoriteDataset = useCallback(
    async (datasetId: string) => {
      const result = await callUserDataApi(
        'DELETE',
        '/user/data/favorites/datasets',
        {
          dataset_id: datasetId,
        },
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_datasets?: FavoriteDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setFavoriteDatasets(body.favorite_datasets);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  return {
    preferences,
    favoriteSearches,
    favoriteDatasets,
    isDevMode,
    getProfile,
    updatePreferenceField,
    saveFavoriteSearch,
    removeFavoriteSearch,
    saveFavoriteDataset,
    removeFavoriteDataset,
  };
}
