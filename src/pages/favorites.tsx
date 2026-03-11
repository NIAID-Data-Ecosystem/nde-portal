/**
 * User Settings Page - Protected route requiring authentication
 */

import { Box, Heading, VStack, Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

function UserFavouritesPage() {
  const { user, logout } = useAuth();

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://api.data.niaid.nih.gov/v1';

  // Remove /v1 suffix for auth endpoints
  const API_BASE_URL = apiUrl.replace(/\/v1$/, '');

  const callUserDataApi = useCallback(
    async (
      method: 'GET' | 'POST' | 'PUT' | 'DELETE',
      path: string,
      body?: unknown,
    ) => {
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

        console.group(`[favorites test] ${method} ${path}`);
        console.log('status', response.status);
        console.log('ok', response.ok);
        console.log('body', parsedBody);
        console.groupEnd();

        return { status: response.status, ok: response.ok, body: parsedBody };
      } catch (error) {
        console.group(`[favorites test] ${method} ${path}`);
        console.error('request failed', error);
        console.groupEnd();
        return { ok: false, error };
      }
    },
    [API_BASE_URL],
  );

  const getProfile = useCallback(() => {
    void callUserDataApi('GET', '/user/data');
  }, [callUserDataApi]);

  const updatePreference = useCallback(() => {
    void callUserDataApi('PUT', '/user/data', {
      ai_toggle_preference: false,
      beta: true,
    });
  }, [callUserDataApi]);

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
          Favourites
        </Heading>
        <VStack align='stretch' spacing={3} lineHeight='shorter' fontSize='md'>
          <Button size='sm' onClick={getProfile}>
            Get Profile
          </Button>
          <Button size='sm' onClick={updatePreference}>
            Update Preference
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
