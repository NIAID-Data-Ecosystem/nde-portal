import { Box, HStack, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { OntologyLineageItemWithCounts } from '../types';

/**
 * OntologyBrowserHeader
 *
 * A component that displays the selected taxonomy term in the ontology browser.
 * - Shows the label of the selected node with a link to its external page.
 * - Provides a link to the taxonomy term.
 */
export const OntologyBrowserHeader = ({
  selectedNode,
}: {
  selectedNode: OntologyLineageItemWithCounts;
}) => {
  return (
    <Box>
      <Text fontWeight='normal' fontSize='sm' lineHeight='short'>
        Selected taxonomy term:{' '}
      </Text>
      <HStack>
        {/* <!--  Link to the external page for the selected taxonomy node. --> */}
        <Link
          href={selectedNode.iri}
          fontWeight='medium'
          isExternal
          fontSize='sm'
        >
          {selectedNode.label}
        </Link>
      </HStack>
    </Box>
  );
};
