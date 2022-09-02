import {
  Box,
  Collapse,
  Flex,
  Icon,
  Text,
  useDisclosure,
} from 'nde-design-system';
import {
  FaChevronDown,
  FaChevronUp,
  FaExclamationCircle,
} from 'react-icons/fa';
import { SelectedFilterType } from '../../../hooks';
// [TO DO]: export to global components.
import { FilterTags as Tags } from 'src/components/search-results-page/components/filters/components/tags';
import { useEffect, useRef, useState } from 'react';

interface FilterTagsProps {
  // Filters applied to data.
  filters: SelectedFilterType;
  // HandlerFn for updating filters.
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  // Remove existing applied filters.
  removeAllFilters: () => void;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  filters,
  removeAllFilters,
  updateFilters,
}) => {
  const COLLAPSE_CONTAINER_HEIGHT = 62; // starting height for tags collapse drawer.
  const tagsContainerRef = useRef<HTMLDivElement>(null); // reference element that contains filter tags.

  // Gives user option to expand list of tags.
  const [showExpansionPanel, setShowExpansionPanel] = useState(false);
  const { isOpen, onToggle } = useDisclosure();

  const filter_tags = Object.entries({
    ...filters,
    date:
      filters.date && filters.date.length > 0
        ? [`${filters.date[0]} to ${filters.date[filters.date.length - 1]}`]
        : [],
  });

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
    <Box border='1px solid' borderColor='gray.200' borderRadius='semi' mb={1}>
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
          <Tags
            tags={filter_tags}
            removeAllFilters={() => removeAllFilters()}
            removeSelectedFilter={(name: string, value: string | number) => {
              let updatedFilter = {
                [name]: filters[name].filter(v => v !== value),
              };
              // If date is removed we set the value to an empty array.
              if (name === 'date') {
                updatedFilter = { [name]: [] };
              }
              updateFilters(updatedFilter);
            }}
            mb={0}
          />
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
