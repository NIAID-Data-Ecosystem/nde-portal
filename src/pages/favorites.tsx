/**
 * User Settings Page - Protected route requiring authentication
 */

import {
  Box,
  Heading,
  VStack,
  Button,
  HStack,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useCallback, useRef, useState } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

function UserFavouritesPage() {
  const { user, logout } = useAuth();
  const defaultAvatarUrl =
    'https://avatars.githubusercontent.com/u/25373313?v=4';
  const isDevMode = process.env.NODE_ENV === 'development';

  type UserPreferences = {
    ai_toggle_preference: boolean;
    avatar_url: string;
    beta: boolean;
    contact_preference: boolean;
  };

  type FavoriteSearch = {
    query: string;
    name: string;
    saved_at?: string;
  };

  type FavoriteDataset = {
    dataset_id: string;
    name: string;
    saved_at?: string;
  };

  type UserProfile = UserPreferences & {
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

  const [preferences, setPreferences] = useState<UserPreferences>({
    ai_toggle_preference: false,
    avatar_url: defaultAvatarUrl,
    beta: true,
    contact_preference: false,
  });

  const mockUserDataRef = useRef<{ profile: UserProfile }>({
    profile: {
      username: 'candicecz',
      oauth_provider: 'GitHub',
      linked_accounts: [],
      ai_toggle_preference: false,
      favorite_searches: [],
      favorite_datasets: [],
      avatar_url: defaultAvatarUrl,
      name: 'Candice',
      email: 'czech.candice@gmail.com',
      beta: true,
      contact_preference: false,
      created: '2026-03-11T19:36:34+00:00',
      updated: '2026-03-11T20:24:13+00:00',
    },
  });

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.data.niaid.nih.gov/v1';

  // Remove /v1 suffix for auth endpoints
  const API_BASE_URL = apiUrl.replace(/\/v1$/, '');

  const logApiResult = useCallback(
    (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      result: { status: number; ok: boolean; body: unknown },
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
    [isDevMode],
  );

  const callMockUserDataApi = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: unknown,
    ) => {
      const store = mockUserDataRef.current;
      let result: { status: number; ok: boolean; body: unknown } = {
        status: 404,
        ok: false,
        body: { error: 'Mock route not found' },
      };

      if (path === '/user/data' && method === 'GET') {
        result = {
          status: 200,
          ok: true,
          body: store.profile,
        };
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
          body: {
            message: 'Mock preferences updated',
            ...store.profile,
          },
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

      logApiResult(method, path, result);
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
    [API_BASE_URL, callMockUserDataApi, isDevMode, logApiResult],
  );

  const getProfile = useCallback(() => {
    void callUserDataApi('GET', '/user/data');
  }, [callUserDataApi]);

  const updatePreferenceField = useCallback(
    (
      field:
        | 'ai_toggle_preference'
        | 'avatar_url'
        | 'beta'
        | 'contact_preference',
    ) => {
      const nextPreferences = {
        ...preferences,
        [field]:
          field === 'avatar_url'
            ? preferences.avatar_url
              ? ''
              : defaultAvatarUrl
            : !preferences[field],
      };

      setPreferences(nextPreferences);
      void callUserDataApi('PUT', '/user/data', nextPreferences);
    },
    [callUserDataApi, defaultAvatarUrl, preferences],
  );

  const saveFavoriteSearch = useCallback(() => {
    void callUserDataApi('POST', '/user/data/favorites/searches', {
      query: 'cancer AND genome',
      name: 'My cancer search',
    });
  }, [callUserDataApi]);

  const removeFavoriteSearch = useCallback(() => {
    void callUserDataApi('DELETE', '/user/data/favorites/searches', {
      index: 0,
    });
  }, [callUserDataApi]);

  const saveFavoriteDataset = useCallback(() => {
    void callUserDataApi('POST', '/user/data/favorites/datasets', {
      dataset_id: 'zenodo.123456',
      name: 'Some Dataset',
    });
  }, [callUserDataApi]);

  const removeFavoriteDataset = useCallback(() => {
    void callUserDataApi('DELETE', '/user/data/favorites/datasets', {
      dataset_id: 'zenodo.123456',
    });
  }, [callUserDataApi]);

  if (!user || !ENABLE_AUTH) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/favorites')} px={0} py={0}>
      <Box
        maxW='md'
        mx='auto'
        my={{ base: 8, md: 16 }}
        bg='white'
        border='1px'
        borderColor='gray.200'
        borderRadius='md'
        boxShadow='sm'
        p={{ base: 6, md: 8 }}
      >
        <Heading as='h1' size='lg' mb={3}>
          Favorites
        </Heading>
        {isDevMode && (
          <Box
            bg='orange.50'
            border='1px'
            borderColor='orange.200'
            borderRadius='md'
            px={3}
            py={2}
            mb={3}
          >
            <Text fontSize='sm' color='orange.800'>
              Using mock user data in development mode
            </Text>
          </Box>
        )}
        <VStack align='stretch' spacing={3} lineHeight='shorter' fontSize='md'>
          <HStack justify='space-between'>
            <Text>Enable AI-assisted search</Text>
            <Switch
              colorScheme='primary'
              isChecked={preferences.ai_toggle_preference}
              onChange={() => updatePreferenceField('ai_toggle_preference')}
            />
          </HStack>

          <HStack justify='space-between'>
            <Text>Enable beta features</Text>
            <Switch
              colorScheme='primary'
              isChecked={preferences.beta}
              onChange={() => updatePreferenceField('beta')}
            />
          </HStack>
          <HStack justify='space-between'>
            <Text>Enable updates</Text>
            <Switch
              colorScheme='primary'
              isChecked={preferences.contact_preference}
              onChange={() => updatePreferenceField('contact_preference')}
            />
          </HStack>
          <Button size='sm' onClick={getProfile}>
            Get Profile
          </Button>
          <Button size='sm' onClick={saveFavoriteSearch}>
            Save Favorite Search
          </Button>
          <Button size='sm' onClick={removeFavoriteSearch}>
            Remove Favorite Search (index 0)
          </Button>
          <Button size='sm' onClick={saveFavoriteDataset}>
            Save Favorite Dataset
          </Button>
          <Button size='sm' onClick={removeFavoriteDataset}>
            Remove Favorite Dataset
          </Button>
          <Button
            colorScheme='red'
            variant='solid'
            size='sm'
            onClick={logout}
            mt={4}
          >
            Log Out
          </Button>
        </VStack>
      </Box>
    </PageContainer>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserFavouritesPage);
