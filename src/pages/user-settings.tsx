/**
 * User Settings Page - Protected route requiring authentication
 */

import {
  Box,
  Container,
  Heading,
  Text,
  Avatar,
  VStack,
  HStack,
  Divider,
  Button,
} from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';
import { withAuth } from 'src/components/auth/withAuth';

function UserSettingsPage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Container maxW='container.md' py={10}>
      <VStack spacing={8} align='stretch'>
        <Heading as='h1' size='lg'>
          User Settings
        </Heading>

        <Box
          bg='white'
          p={6}
          borderRadius='md'
          boxShadow='sm'
          border='1px'
          borderColor='gray.200'
        >
          <HStack spacing={4} mb={6}>
            {user.avatar_url && (
              <Avatar size='lg' src={user.avatar_url} name={user.name} />
            )}
            <VStack align='start' spacing={0}>
              <Text fontWeight='bold' fontSize='xl'>
                {user.name}
              </Text>
              <Text color='gray.600'>@{user.username}</Text>
            </VStack>
          </HStack>

          <Divider mb={4} />

          <VStack align='stretch' spacing={3}>
            <HStack justify='space-between'>
              <Text fontWeight='medium'>Provider</Text>
              <Text color='gray.600'>{user.oauth_provider}</Text>
            </HStack>

            {user.email && (
              <HStack justify='space-between'>
                <Text fontWeight='medium'>Email</Text>
                <Text color='gray.600'>{user.email}</Text>
              </HStack>
            )}

            {user.organization && (
              <HStack justify='space-between'>
                <Text fontWeight='medium'>Organization</Text>
                <Text color='gray.600'>{user.organization}</Text>
              </HStack>
            )}
          </VStack>
        </Box>

        <Button colorScheme='red' variant='outline' onClick={logout}>
          Log Out
        </Button>
      </VStack>
    </Container>
  );
}

// Wrap with auth protection - shows login prompt if not authenticated
export default withAuth(UserSettingsPage);

// Required for static export
export function getStaticProps() {
  return { props: {} };
}
