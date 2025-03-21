import { Button, Flex, Text } from '@chakra-ui/react';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

interface WarningProps {
  // The current node being displayed.
  node: OntologyLineageItemWithCounts;
  // Callback to show hidden children
  onClick: () => void;
}

export const Warning = ({ node, onClick }: WarningProps) => {
  return (
    <Flex
      ml={4}
      pl={10}
      pr={4}
      flexDirection='column'
      alignItems='flex-start'
      lineHeight='shorter'
    >
      <Text pr={4}>
        <Text as='span' fontWeight='semibold'>
          {node.label} (Taxon ID: {node.taxonId})
        </Text>{' '}
        has hidden children with 0 associated datasets.{' '}
      </Text>
      {/* Button to update config to show hidden dataset */}
      <Button
        variant='link'
        color='yellow.700'
        size='sm'
        onClick={onClick}
        fontSize='inherit'
      >
        Show hidden terms
      </Button>
    </Flex>
  );
};
