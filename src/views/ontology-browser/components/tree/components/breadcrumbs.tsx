import React from 'react';
import { FaAngleRight, FaEllipsis } from 'react-icons/fa6';
import { Button, Flex, HStack, Icon, IconButton } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { OntologyLineageItemWithCounts } from '../../../types';

/**
 * OntologyTreeBreadcrumbs
 *
 * A component that displays a breadcrumb-style navigation for the ontology tree.
 * - Shows the lineage of ontology lineageNodes as clickable buttons.
 * - Allows navigation to a specific node by clicking on its label.
 * - Includes a "Show parent" button to navigate to higher-level parent lineageNodes.
 * - Dynamically updates the view based on the selected node index.
 *
 * Props:
 * @param margin: number - The left margin for the breadcrumbs.
 * @param lineageNodes: OntologyLineageItemWithCounts[] - The lineage nodes to display.
 * @param showFromIndex: number - The index of the selected node in the lineage.
 * @param updateShowFromIndex: (index: number) => void - Function to update the selected node index.
 */
export const OntologyTreeBreadcrumbs = ({
  lineageNodes,
  showFromIndex,
  updateShowFromIndex,
}: {
  lineageNodes: OntologyLineageItemWithCounts[];
  showFromIndex: number;
  updateShowFromIndex: (index: number) => void;
}) => {
  return (
    <>
      {/*
      Render the lineage nodes as clickable buttons with an arrow divider.
      - The buttons display the label of each node.
      - Clicking on a button updates the selected node index.
      */}
      <HStack
        alignItems='center'
        borderColor='gray.200'
        px={4}
        py={2}
        pl={4}
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
        {lineageNodes.map((node, index) => (
          <React.Fragment key={node.id}>
            <Button
              colorScheme='gray'
              variant='ghost'
              size='sm'
              px={1}
              _hover={{ textDecoration: 'underline' }}
              // Update the selected node index when clicked
              onClick={() => updateShowFromIndex(index)}
            >
              {node.label}
            </Button>
          </React.Fragment>
        ))}
      </HStack>
      {/*
      Include a "Show parent" button to navigate to higher-level parent lineageNodes.
      - The button updates the selected node index to show the parent node.
      - The button is disabled when the selected node is the root node.
      */}
      <Tooltip label='Show parent'>
        <Flex
          alignItems='center'
          borderY='0.25px solid'
          borderColor='gray.200'
          px={4}
          py={2}
          pl={4}
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
