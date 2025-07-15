import { HStack, VStack, StackDivider, Text } from '@chakra-ui/react';
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
  selectedNode?: OntologyLineageItemWithCounts | null;
}) => {
  return (
    <VStack
      alignItems='flex-start'
      fontSize='sm'
      lineHeight='short'
      spacing={1}
      flex={1}
    >
      {selectedNode && (
        <>
          <Text fontWeight='normal'>Selected taxonomy term:</Text>
          <HStack divider={<StackDivider borderColor='gray.200' />} spacing={2}>
            <Text as='span' fontWeight='medium'>
              {selectedNode.label}
            </Text>

            {/* <!--  Link to the external page for the selected taxonomy node. --> */}
            <Link
              href={`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${selectedNode.taxonId}`}
              isExternal
              _visited={{ color: 'inherit' }}
            >
              View NCBI classification
            </Link>
          </HStack>
        </>
      )}
    </VStack>
  );
};
