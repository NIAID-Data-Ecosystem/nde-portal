/**
 * User Favorites Page - Protected route requiring authentication
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
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useUserData } from 'src/hooks/useUserData';
import { ENABLE_AUTH } from 'src/utils/feature-flags';

function UserFavouritesPage() {
  const { user, logout } = useAuth();
  const {
    preferences,
    isDevMode,
    getProfile,
    updatePreferenceField,
    saveFavoriteSearch,
    removeFavoriteSearch,
    saveFavoriteDataset,
    removeFavoriteDataset,
  } = useUserData();

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
          <Button
            size='sm'
            onClick={() =>
              saveFavoriteSearch({
                query: 'cancer AND genome',
                name: 'My cancer search',
              })
            }
          >
            Save Favorite Search
          </Button>
          <Button size='sm' onClick={() => removeFavoriteSearch(0)}>
            Remove Favorite Search (index 0)
          </Button>
          <Button
            size='sm'
            onClick={() =>
              saveFavoriteDataset({
                dataset_id: 'zenodo.123456',
                name: 'Some Dataset',
              })
            }
          >
            Save Favorite Dataset
          </Button>
          <Button
            size='sm'
            onClick={() => removeFavoriteDataset('zenodo.123456')}
          >
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
