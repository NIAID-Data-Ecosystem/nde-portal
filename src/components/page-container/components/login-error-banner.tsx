import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { CloseButton, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FaCircleXmark } from 'react-icons/fa6';

/**
 * Login error codes appended by the auth API as a `login_error` query param
 * when an OAuth login fails. The user is redirected back to their previous
 * page with one of these codes so we can surface a friendly message.
 */
export const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  github_unavailable:
    'GitHub login is temporarily unavailable. Please try again in a moment.',
  orcid_unavailable:
    'ORCID login is temporarily unavailable. Please try again in a moment.',
  github_login_failed:
    'GitHub login could not be completed. Please try signing in again.',
  orcid_login_failed:
    'ORCID login could not be completed. Please try signing in again.',
};

export const LoginErrorBanner = () => {
  const router = useRouter();

  const loginError = useMemo(() => {
    const param = router.query.login_error;
    return Array.isArray(param) ? param[0] : param;
  }, [router.query.login_error]);

  const message = loginError ? LOGIN_ERROR_MESSAGES[loginError] : undefined;

  // Remove the `login_error` query param so the banner doesn't reappear on
  // refresh or navigation, while preserving any other query params.
  const handleClose = () => {
    const { login_error, ...rest } = router.query;
    router.replace({ pathname: router.pathname, query: rest }, undefined, {
      shallow: true,
    });
  };

  if (!message) return null;

  return (
    <Flex
      role='alert'
      px={4}
      py={2}
      borderLeft='0.5rem solid'
      borderColor='status.error'
      bg='status.error_lt'
    >
      <HStack spacing={4} flex={1} alignItems='center'>
        <HStack flex={1} spacing={{ base: 2, sm: 4 }} alignItems='center'>
          <Icon as={FaCircleXmark} boxSize={6} fill='status.error' />
          <Text fontSize='md' fontWeight='medium' lineHeight='short'>
            {message}
          </Text>
        </HStack>
        <CloseButton
          aria-label='Dismiss login error'
          size='sm'
          onClick={handleClose}
        />
      </HStack>
    </Flex>
  );
};
