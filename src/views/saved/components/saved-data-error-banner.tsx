import { CloseButton, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FaCircleXmark } from 'react-icons/fa6';
import { useUserData } from 'src/hooks/useUserData';

/**
 * Surfaces the last failed saved-items action (save/remove of a query or
 * resource) as a dismissible banner, so a failed request — e.g. the favorites
 * API rejecting a delete — isn't silent. Reads shared state from `useUserData`,
 * so it reflects failures from any consumer and clears on the next success.
 * Mirrors the `LoginErrorBanner` styling for consistency.
 */
export const SavedDataErrorBanner = () => {
  const { error, clearError } = useUserData();

  if (!error) return null;

  return (
    <Flex
      role='alert'
      px={2}
      py={2}
      borderLeft='0.5rem solid'
      borderColor='status.error'
      bg='status.error_lt'
    >
      <HStack spacing={4} flex={1} justifyContent='space-between'>
        <HStack flex={1} spacing={{ base: 2, sm: 4 }} alignItems='flex-start'>
          <Icon as={FaCircleXmark} boxSize={6} fill='status.error' />
          <Text fontSize='md' fontWeight='medium' lineHeight='short'>
            {error}
          </Text>
        </HStack>
        <CloseButton
          aria-label='Dismiss error'
          size='sm'
          onClick={clearError}
        />
      </HStack>
    </Flex>
  );
};
