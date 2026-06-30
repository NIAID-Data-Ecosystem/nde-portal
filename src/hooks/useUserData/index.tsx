import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { MOCK_SAVED_DATASETS } from './mocks/saved_datasets';
import {
  SavedDataset,
  SavedQuery,
  UserPreferences,
  UserPreferencesKeys,
  UserProfile,
} from './types';
import { MOCK_SAVED_QUERIES } from './mocks/saved_queries';
import {
  findSavedQueryIndex,
  formatSavedQueryFilters,
  parseSavedQueries,
} from './helpers';

const DEFAULT_PREFERENCES: UserPreferences = {
  ai_toggle_preference: false,
  beta: false,
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

function useUserDataState() {
  const [preferences, setPreferences] =
    useState<UserPreferences>(DEFAULT_PREFERENCES);

  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);

  const [savedDatasets, setSavedDatasets] = useState<SavedDataset[]>([]);

  // Last failed saved-items mutation, surfaced to the UI as an error banner.
  // Cleared whenever a subsequent mutation succeeds (or on manual dismiss).
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  // Mirror the latest savedQueries so identity-based deletes resolve the index
  // from the freshest list (never a stale render closure). Updated every render.
  const savedQueriesRef = useRef<SavedQuery[]>(savedQueries);
  savedQueriesRef.current = savedQueries;

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
        // Build a new array (rather than mutating in place) so the returned
        // reference differs and React re-renders consumers.
        const favorite_searches = [
          ...store.profile.favorite_searches,
          {
            query: payload.query,
            name: payload.name,
            filters: payload.filters,
            saved_at: now,
            total: payload.total,
          },
        ];
        store.profile = { ...store.profile, favorite_searches, updated: now };
        result = {
          status: 200,
          ok: true,
          body: {
            message: 'Mock favorite search saved',
            favorite_searches,
          },
        };
      } else if (
        path === '/user/data/favorites/searches' &&
        method === 'DELETE'
      ) {
        const now = new Date().toISOString();
        const payload = body as { index: number };
        if (typeof payload?.index === 'number' && payload.index >= 0) {
          const favorite_searches = store.profile.favorite_searches.filter(
            (_, i) => i !== payload.index,
          );
          store.profile = { ...store.profile, favorite_searches, updated: now };
          result = {
            status: 200,
            ok: true,
            body: {
              message: 'Mock favorite search removed',
              favorite_searches,
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
        // Build a new array (rather than mutating in place) so the returned
        // reference differs and React re-renders consumers.
        const favorite_datasets = [
          ...store.profile.favorite_datasets,
          {
            dataset_id: payload.dataset_id,
            name: payload.name,
            saved_at: now,
          },
        ];
        store.profile = { ...store.profile, favorite_datasets, updated: now };
        result = {
          status: 200,
          ok: true,
          body: {
            message: 'Mock favorite dataset saved',
            favorite_datasets,
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
        setSavedQueries(parseSavedQueries(profile.favorite_searches));
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
    async (search: Omit<SavedQuery, 'total'>) => {
      const result = await callUserDataApi(
        'POST',
        '/user/data/favorites/searches',
        { ...search, filters: formatSavedQueryFilters(search.filters) },
      );
      if (result && 'body' in result && result.ok) {
        setError(null);
        const body = result.body as { favorite_searches?: SavedQuery[] };
        if (Array.isArray(body.favorite_searches)) {
          setSavedQueries(parseSavedQueries(body.favorite_searches));
        }
      } else {
        setError('Unable to save this query. Please try again.');
      }
      return result;
    },
    [callUserDataApi],
  );

  const removeSavedQuery = useCallback(
    async (search: Pick<SavedQuery, 'query' | 'filters'>) => {
      // Resolve the index from the freshest list at call time. The favorites API
      // deletes by index, so a stale index (e.g. computed before a prior delete
      // shrank the list) would return "Index out of range".
      const index = findSavedQueryIndex(savedQueriesRef.current, search);
      if (index === -1) {
        // Already gone (e.g. removed by another action) — nothing to do.
        setError(null);
        return {
          status: 200,
          ok: true,
          body: { favorite_searches: savedQueriesRef.current },
        };
      }
      const result = await callUserDataApi(
        'DELETE',
        '/user/data/favorites/searches',
        { index },
      );
      if (result && 'body' in result && result.ok) {
        setError(null);
        const body = result.body as { favorite_searches?: SavedQuery[] };
        if (Array.isArray(body.favorite_searches)) {
          setSavedQueries(parseSavedQueries(body.favorite_searches));
        }
      } else {
        setError('Unable to remove this saved query. Please try again.');
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
      if (result && 'body' in result && result.ok) {
        setError(null);
        const body = result.body as { favorite_datasets?: SavedDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setSavedDatasets(body.favorite_datasets);
        }
      } else {
        setError('Unable to save this resource. Please try again.');
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
      if (result && 'body' in result && result.ok) {
        setError(null);
        const body = result.body as { favorite_datasets?: SavedDataset[] };
        if (Array.isArray(body.favorite_datasets)) {
          setSavedDatasets(body.favorite_datasets);
        }
      } else {
        setError('Unable to remove this saved resource. Please try again.');
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
    error,
    clearError,
    getProfile,
    updatePreferenceField,
    addSavedQuery,
    removeSavedQuery,
    addSavedDataset,
    removeSavedDataset,
  };
}

type UserDataContextValue = ReturnType<typeof useUserDataState>;

const UserDataContext = createContext<UserDataContextValue | undefined>(
  undefined,
);

/**
 * Holds the single source of truth for the signed-in user's saved data
 * (preferences, saved queries, saved datasets). Mounting this once (in `_app`)
 * means every consumer shares one fetched-and-mutated state, so a delete in one
 * component re-syncs the rest. Without it, each `useUserData()` call kept its own
 * copy and index-based deletes drifted out of range.
 */
export function UserDataProvider({ children }: { children: ReactNode }) {
  const value = useUserDataState();
  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
