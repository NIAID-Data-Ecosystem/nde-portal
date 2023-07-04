import { useEffect, useRef, useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
  FaExclamationCircle,
} from 'react-icons/fa';
import {
  Box,
  Collapse,
  Flex,
  Icon,
  Text,
  useDisclosure,
  theme,
} from 'nde-design-system';
import { SelectedFilterType } from '../types';

interface FilterTagsWrapperProps {
  colorScheme?: keyof typeof theme.colors;
  // Filters applied to data.
  filters: SelectedFilterType;
}
/*
[COMPONENT INFO]: Drawer that wraps the filter
*/

export const FilterTagsWrapper: React.FC<FilterTagsWrapperProps> = ({
  filters,
  children,
  colorScheme = 'secondary',
}) => {
  const COLLAPSE_CONTAINER_HEIGHT = 62; // starting height for tags collapse drawer.
  const tagsContainerRef = useRef<HTMLDivElement>(null); // reference element that contains filter tags.

  // Gives user option to expand list of tags.
  const [showExpansionPanel, setShowExpansionPanel] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    const tags_el_height =
      tagsContainerRef?.current?.firstElementChild?.clientHeight || 0;
    setShowExpansionPanel(tags_el_height > COLLAPSE_CONTAINER_HEIGHT);
  }, [setShowExpansionPanel, tagsContainerRef, filters]);

  // Check if filters exist.
  if (Object.values(filters).flat().length === 0) {
    return <></>;
  }

  return (
    <Box
      border='1px solid'
      borderColor='gray.200'
      borderRadius='semi'
      bg={`${colorScheme}.50`}
      mb={2}
    >
      <Collapse
        in={isOpen}
        animateOpacity
        startingHeight={COLLAPSE_CONTAINER_HEIGHT}
      >
        <Box
          id='tags-container'
          ref={tagsContainerRef}
          h='100%'
          overflowY='auto'
        >
          {children}
        </Box>
      </Collapse>
      {/* only show this option if tags exceed container height */}
      {showExpansionPanel && (
        <Flex
          as='button'
          w='100%'
          p={2}
          bg={isOpen ? 'gray.100' : 'gray.50'}
          borderTop='1px solid'
          borderColor='gray.200'
          alignItems='center'
          onClick={() => onToggle()}
          _hover={{
            bg: 'gray.100',
            transition: 'all 0.2s linear',
          }}
        >
          <Flex
            alignItems='center'
            justifyContent='center'
            flex={1}
            opacity={isOpen ? 0.5 : 1}
          >
            <Icon as={FaExclamationCircle} mr={2} boxSize={4}></Icon>
            <Text>Click here to see all applied filters. </Text>
          </Flex>
          <Icon as={isOpen ? FaChevronUp : FaChevronDown} mr={2}></Icon>
        </Flex>
      )}
    </Box>
  );
};
