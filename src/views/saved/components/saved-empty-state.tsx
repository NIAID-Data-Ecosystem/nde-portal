import { Flex, Text } from '@chakra-ui/react';

interface SavedEmptyStateProps {
  /** Bold heading, e.g. "No matches" or "Nothing saved yet". */
  title: string;
  /** Supporting copy rendered under the heading. */
  children: React.ReactNode;
}

/**
 * Centered heading + description used for the empty states of the saved-items
 * tables (no matches, nothing saved yet, etc.). No padding of its own: the
 * table's status cell already pads it.
 */
export function SavedEmptyState({ title, children }: SavedEmptyStateProps) {
  return (
    <Flex direction='column' align='center'>
      <Text fontWeight='bold'>{title}</Text>
      <Text
        color='gray.500'
        maxWidth='300px'
        textAlign='center'
        lineHeight='moderate'
        whiteSpace='normal'
      >
        {children}
      </Text>
    </Flex>
  );
}
