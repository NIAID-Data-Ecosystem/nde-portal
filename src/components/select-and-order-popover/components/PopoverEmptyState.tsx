import { Text } from '@chakra-ui/react';
import React from 'react';

interface PopoverEmptyStateProps {
  message?: string;
}

/**
 * Shown when a search term matches no items.
 */
export const PopoverEmptyState = ({
  message = 'No items found',
}: PopoverEmptyStateProps) => (
  <Text fontSize='sm' color='gray.600' px={3} py={2}>
    {message}
  </Text>
);
