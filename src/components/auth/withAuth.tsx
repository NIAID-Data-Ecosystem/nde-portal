/**
 * Higher-Order Component for protecting pages that require authentication
 * Use this to wrap pages that should only be accessible to logged-in users
 */

import { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Spinner, Text } from '@chakra-ui/react';
import { useAuth } from 'src/hooks/useAuth';

interface WithAuthOptions {
  /**
   * Where to redirect if not authenticated
   * Defaults to showing login prompt on page
   */
  redirectTo?: string;
  /**
   * Custom loading component
   */
  LoadingComponent?: ComponentType;
}

/**
 * HOC to protect pages requiring authentication
 *
 * @example
 * // Basic usage - shows login prompt if not authenticated
 * export default withAuth(DashboardPage);
 *
 * @example
 * // With redirect
 * export default withAuth(DashboardPage, { redirectTo: '/' });
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithAuthOptions = {},
): ComponentType<P> {
  const { redirectTo, LoadingComponent } = options;

  function AuthenticatedComponent(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading, login } = useAuth();

    useEffect(() => {
      if (!isLoading && !isAuthenticated && redirectTo) {
        // Store current path to redirect back after login
        sessionStorage.setItem('auth_return_to', router.asPath);
        router.replace(redirectTo);
      }
    }, [isLoading, isAuthenticated, router]);

    // Show loading state
    if (isLoading) {
      if (LoadingComponent) {
        return <LoadingComponent />;
      }
      return (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='50vh'
        >
          <Spinner size='lg' color='blue.500' />
          <Text mt={4} color='gray.600'>
            Loading...
          </Text>
        </Box>
      );
    }

    // If not authenticated and no redirect, show login prompt
    if (!isAuthenticated && !redirectTo) {
      return (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          minHeight='50vh'
          textAlign='center'
          p={8}
        >
          <Text fontSize='xl' fontWeight='bold' mb={2}>
            Authentication Required
          </Text>
          <Text color='gray.600' mb={4}>
            Please log in to access this page.
          </Text>
          <Box
            as='button'
            px={6}
            py={3}
            bg='blue.500'
            color='white'
            borderRadius='md'
            fontWeight='semibold'
            _hover={{ bg: 'blue.600' }}
            onClick={() => {
              sessionStorage.setItem('auth_return_to', router.asPath);
              login();
            }}
          >
            Log In with ORCID
          </Box>
        </Box>
      );
    }

    // User is authenticated, render the component
    if (isAuthenticated) {
      return <WrappedComponent {...props} />;
    }

    // Redirecting...
    return null;
  }

  // Copy display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return AuthenticatedComponent;
}
