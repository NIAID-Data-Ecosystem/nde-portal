import React from 'react';
import { FaAngleRight, FaEllipsis } from 'react-icons/fa6';
import { Button, Flex, HStack, Icon, IconButton } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { OntologyLineageItemWithCounts } from '../types';

/**
 * OntologyTreeBreadcrumbs
 *
 * A component that displays a breadcrumb-style navigation for the ontology tree.
 * - Shows the lineage of ontology nodes as clickable buttons.
 * - Allows navigation to a specific node by clicking on its label.
 * - Includes a "Show parent" button to navigate to higher-level parent nodes.
 * - Dynamically updates the view based on the selected node index.
 *
 * Props:
 * @param margin: number - The left margin for the breadcrumbs.
 * @param nodes: OntologyLineageItemWithCounts[] - The lineage nodes to display.
 * @param showFromIndex: number - The index of the selected node in the lineage.
 * @param updateShowFromIndex: (index: number) => void - Function to update the selected node index.
 */
export const OntologyTreeBreadcrumbs = ({
  margin: MARGIN,
  nodes,
  showFromIndex,
  updateShowFromIndex,
}: {
  margin: number;
  nodes: OntologyLineageItemWithCounts[];
  showFromIndex: number;
  updateShowFromIndex: (index: number) => void;
}) => {
  if (showFromIndex === 0) {
    return <></>;
  }
  return (
    <>
      <HStack
        alignItems='center'
        borderColor='gray.200'
        px={4}
        py={2}
        pl={`${MARGIN}px`}
        flexWrap='wrap'
        spacing={0}
        divider={
          <Icon
            as={FaAngleRight}
            color='gray.400'
            boxSize={3}
            borderLeft='none'
          />
        }
      >
        {nodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <Button
              colorScheme='gray'
              variant='ghost'
              size='sm'
              px={1}
              _hover={{ textDecoration: 'underline' }}
              onClick={() => updateShowFromIndex(index)}
            >
              {node.label}
            </Button>
          </React.Fragment>
        ))}
      </HStack>
      <Tooltip label='Show parent'>
        <Flex
          alignItems='center'
          borderY='0.25px solid'
          borderColor='gray.200'
          px={4}
          py={2}
          pl={`${MARGIN}px`}
          onClick={() => {
            updateShowFromIndex(showFromIndex < 1 ? 0 : showFromIndex - 1);
          }}
          cursor='pointer'
          _hover={{
            bg: 'blackAlpha.100',
          }}
        >
          <IconButton
            aria-label='show parent node'
            icon={<FaEllipsis />}
            variant='ghost'
            colorScheme='gray'
            size='sm'
            color='currentColor'
            justifyContent='flex-start'
            px={2}
          />
        </Flex>
      </Tooltip>
    </>
  );
};
