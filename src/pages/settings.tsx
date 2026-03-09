/**
 * User Settings Page - Protected route requiring authentication
 */

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';

function UserSettingsPage() {
  const { user, logout } = useAuth();

  if (!user) return null;
  return (
    <PageContainer meta={getPageSeoConfig('/settings')} px={0} py={0}>
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
          Account Settings
        </Heading>
        <VStack align='start' spacing={1} lineHeight='shorter' fontSize='md'>
          <Text fontWeight='semibold'>{user.name}</Text>
          <Text color='gray.700'>@{user.username}</Text>
        </VStack>
        <Divider my={4} />
        <VStack align='stretch' spacing={2} lineHeight='shorter'>
          <HStack justify='space-between'>
            <Text fontWeight='medium'>Provider</Text>
            <Text color='gray.700'>{user.oauth_provider}</Text>
          </HStack>

          {user.email && (
            <HStack justify='space-between'>
              <Text fontWeight='medium'>Email</Text>
              <Text color='gray.700'>{user.email}</Text>
            </HStack>
          )}

          {user.organization && (
            <HStack justify='space-between'>
              <Text fontWeight='medium'>Organization</Text>
              <Text color='gray.700'>{user.organization}</Text>
            </HStack>
          )}
          <Button
            colorScheme='red'
            variant='outline'
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
export default withAuth(UserSettingsPage);
