import { useCallback, useEffect, useRef, useState } from 'react';
import { MOCK_SAVED_DATASETS } from './mocks/saved_datasets';
import {
  SavedDataset,
  SavedQuery,
  UserPreferences,
  UserPreferencesKeys,
  UserProfile,
} from './types';
import { MOCK_SAVED_QUERIES } from './mocks/saved_queries';

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
  favorite_searches: MOCK_SAVED_QUERIES,
  favorite_datasets: MOCK_SAVED_DATASETS,
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

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  const [savedDatasets, setSavedDatasets] = useState<SavedDataset[]>([]);

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
        const payload = body as SavedQuery;
        store.profile.favorite_searches.push({
          query: payload.query,
          name: payload.name,
          filters: payload.filters,
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
        const payload = body as SavedDataset;
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
        setSavedQueries(profile.favorite_searches);
      }
      if (Array.isArray(profile.favorite_datasets)) {
        setSavedDatasets(profile.favorite_datasets);
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

  const addSavedQuery = useCallback(
    async (search: SavedQuery) => {
      const result = await callUserDataApi(
        'POST',
        '/user/data/favorites/searches',
        search,
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_searches?: SavedQuery[] };
        if (Array.isArray(body.favorite_searches)) {
          setSavedQueries(body.favorite_searches);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const removeSavedQuery = useCallback(
    async (index: number) => {
      const result = await callUserDataApi(
        'DELETE',
        '/user/data/favorites/searches',
        { index },
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_searches?: SavedQuery[] };
        if (Array.isArray(body.favorite_searches)) {
          setSavedQueries(body.favorite_searches);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const addSavedDataset = useCallback(
    async (dataset: SavedDataset) => {
      const result = await callUserDataApi(
        'POST',
        '/user/data/favorites/datasets',
        dataset,
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_datasets?: SavedDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setSavedDatasets(body.favorite_datasets);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  const removeSavedDataset = useCallback(
    async (datasetId: string) => {
      const result = await callUserDataApi(
        'DELETE',
        '/user/data/favorites/datasets',
        {
          dataset_id: datasetId,
        },
      );
      if (result && 'body' in result && result.ok && result.body) {
        const body = result.body as { favorite_datasets?: SavedDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setSavedDatasets(body.favorite_datasets);
        }
      }
      return result;
    },
    [callUserDataApi],
  );

  return {
    preferences,
    savedQueries,
    savedDatasets,
    isDevMode,
    getProfile,
    updatePreferenceField,
    addSavedQuery,
    removeSavedQuery,
    addSavedDataset,
    removeSavedDataset,
  };
}
