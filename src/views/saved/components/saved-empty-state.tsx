import { Flex, Text } from '@chakra-ui/react';

interface SavedEmptyStateProps {
  /** Bold heading, e.g. "No matches" or "Nothing saved yet". */
  title: string;
  /** Supporting copy rendered under the heading. */
  children: React.ReactNode;
}

/**
 * Centered heading + description used for the empty states of the saved-items
 * tables (no matches, nothing saved yet, etc.).
 */
export function SavedEmptyState({ title, children }: SavedEmptyStateProps) {
  return (
    <Flex direction='column' align='center' py={10}>
      <Text fontWeight='bold'>{title}</Text>
      <Text
        color='gray.700'
        maxWidth='300px'
        textAlign='center'
        lineHeight='short'
        whiteSpace='normal'
      >
        {children}
      </Text>
    </Flex>
  );
}
