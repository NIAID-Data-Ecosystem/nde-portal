import React from 'react';
import { Button, Flex, Text } from '@chakra-ui/react';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

interface PaginationProps {
  hasMore: boolean;
  isDisabled: boolean;
  isLoading: boolean;
  // The current node being displayed.
  node: OntologyLineageItemWithCounts;
  // The total number of possible children for the node.id.
  numChildrenDisplayed: number;
  // Callback to load more children
  onShowMore: () => void;
  // The total number of children regardless of view settings (impacted by pagination).
  totalElements: number;
}

export const Pagination = ({
  hasMore,
  isDisabled,
  isLoading,
  node,
  numChildrenDisplayed,
  onShowMore,
  totalElements,
}: PaginationProps) => {
  return (
    <Flex
      ml={4}
      pl={10}
      pr={4}
      flexDirection='row'
      alignItems='baseline'
      flex={1}
      fontSize='xs'
      lineHeight='shorter'
    >
      <Text>
        Displaying {numChildrenDisplayed} of {totalElements.toLocaleString()}{' '}
        children for{' '}
        <Text as='span' fontWeight='semibold'>
          {node.label} (Taxon ID: {node.taxonId}).
        </Text>
      </Text>
      {hasMore && (
        <Button
          isDisabled={isDisabled}
          isLoading={isLoading}
          size='sm'
          variant='link'
          onClick={onShowMore}
          fontSize='inherit'
          mx={2}
        >
          Show more
        </Button>
      )}
    </Flex>
  );
};
