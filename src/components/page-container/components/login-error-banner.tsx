import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { CloseButton, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FaCircleXmark } from 'react-icons/fa6';
import { getLoginErrorMessage } from 'src/utils/auth/helpers';

export const LoginErrorBanner = () => {
  const router = useRouter();

  const loginError = useMemo(() => {
    const param = router.query.login_error;
    return Array.isArray(param) ? param[0] : param;
  }, [router.query.login_error]);

  const message = loginError ? getLoginErrorMessage(loginError) : undefined;

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
