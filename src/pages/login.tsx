import React from 'react';
import { Box, Button, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { getPageSeoConfig, PageContainer } from 'src/components/page-container';
import { useAuth } from 'src/hooks/useAuth';

function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, loginProviders, login } = useAuth();

  React.useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const returnTo =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('auth_return_to') || '/'
          : '/';
      router.replace(returnTo);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <PageContainer meta={getPageSeoConfig('/login')} px={0} py={0}>
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
          Log in to your account
        </Heading>
        <Text color='gray.700' mb={6}>
          Choose a provider to continue.
        </Text>

        {isLoading ? (
          <Stack align='center' py={4}>
            <Spinner color='niaid.500' />
            <Text color='gray.700'>Checking authentication status...</Text>
          </Stack>
        ) : (
          <Stack spacing={3}>
            {loginProviders.map(provider => (
              <Button
                key={provider.id}
                w='100%'
                colorScheme='gray'
                variant='outline'
                onClick={() => login(provider.id)}
              >
                Continue with {provider.label}
              </Button>
            ))}
          </Stack>
        )}
      </Box>
    </PageContainer>
  );
}

export default LoginPage;

export function getStaticProps() {
  return { props: {} };
}
