import React, { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Icon,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
} from '@chakra-ui/react';
import { FilterConfig } from '../../types';
import { FaSliders } from 'react-icons/fa6';
import { filterGroupsBySearchTerm, groupFiltersByCategory } from './utils';

const CUSTOM_VISIBLE_FILTERS_STORAGE_KEY = 'search-visible-filters';

const CUSTOMIZE_FILTERS_COPY = {
  button: 'Customize Filters',
  header: 'Customize Filters',
  description: 'Select which filters to display.',
  searchPlaceholder: 'Search filters',
  noFiltersFound: 'No filters found',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

interface CustomizeFiltersPopoverProps {
  filtersList: FilterConfig[];
  onVisibleFiltersChange?: (visibleFilterIds: string[]) => void;
}

export const CustomizeFiltersPopover: React.FC<
  CustomizeFiltersPopoverProps
> = ({ filtersList, onVisibleFiltersChange }) => {
  const [visibleFilterIds, setVisibleFilterIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCount = visibleFilterIds.length;

  const allFilterIds = useMemo(
    () => filtersList.map(filter => filter.id),
    [filtersList],
  );

  const filterGroups = useMemo(
    () => groupFiltersByCategory(filtersList),
    [filtersList],
  );

  const filteredGroups = useMemo(
    () => filterGroupsBySearchTerm(filterGroups, searchTerm),
    [filterGroups, searchTerm],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedValue = window.localStorage.getItem(
      CUSTOM_VISIBLE_FILTERS_STORAGE_KEY,
    );
    // If no stored value, default to showing all filters.
    if (!storedValue) {
      setVisibleFilterIds(allFilterIds);
      setIsReady(true);
      return;
    }

    try {
      const parsedIds = JSON.parse(storedValue);

      if (!Array.isArray(parsedIds)) {
        setVisibleFilterIds(allFilterIds);
        setIsReady(true);
        return;
      }

      const validIds = parsedIds.filter((id: unknown): id is string =>
        allFilterIds.includes(id as string),
      );

      setVisibleFilterIds(validIds);
      setIsReady(true);
    } catch {
      setVisibleFilterIds(allFilterIds);
      setIsReady(true);
    }
  }, [allFilterIds]);

  useEffect(() => {
    if (!isReady) return;

    onVisibleFiltersChange?.(visibleFilterIds);
  }, [visibleFilterIds, onVisibleFiltersChange, isReady]);

  const handleVisibleFiltersChange = (values: string[]) => {
    setVisibleFilterIds(values);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        CUSTOM_VISIBLE_FILTERS_STORAGE_KEY,
        JSON.stringify(values),
      );
    }
  };

  return (
    <Popover placement='bottom-end'>
      <Flex justifyContent='flex-end'>
        <PopoverTrigger>
          <Button colorScheme='gray' variant='outline' size='sm' flex={1}>
            <Icon as={FaSliders} boxSize={4} mr={2} />
            {CUSTOMIZE_FILTERS_COPY.button}
          </Button>
        </PopoverTrigger>
      </Flex>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight='semibold'>
          <Text>{CUSTOMIZE_FILTERS_COPY.header}</Text>
          <Text fontSize='sm' fontWeight='normal'>
            {CUSTOMIZE_FILTERS_COPY.description}
          </Text>
          <Flex justifyContent='flex-end' flex={1}>
            <Button
              size='xs'
              variant='link'
              colorScheme='black'
              onClick={() =>
                handleVisibleFiltersChange(
                  selectedCount === allFilterIds.length ? [] : allFilterIds,
                )
              }
            >
              {selectedCount === allFilterIds.length
                ? CUSTOMIZE_FILTERS_COPY.clearAll
                : `${CUSTOMIZE_FILTERS_COPY.selectAll} (${allFilterIds.length})`}
            </Button>
          </Flex>
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          <Flex px={2} py={1}>
            <Input
              size='sm'
              placeholder={CUSTOMIZE_FILTERS_COPY.searchPlaceholder}
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
            />
          </Flex>
          <CheckboxGroup
            size='md'
            value={visibleFilterIds}
            onChange={values => handleVisibleFiltersChange(values as string[])}
          >
            <Flex flexDirection='column' maxHeight='16rem' overflowY='auto'>
              {filteredGroups.map(group => (
                <Stack
                  key={group.category}
                  gap={0.5}
                  borderBottom='1px solid'
                  borderColor='gray.100'
                  px={2}
                  py={1}
                >
                  <Text
                    fontSize='xs'
                    fontWeight='semibold'
                    color='gray.800'
                    px={1}
                  >
                    {group.category}
                  </Text>
                  {group.filters.map(filter => (
                    <Checkbox
                      key={filter.id}
                      value={filter.id}
                      px={2}
                      _hover={{ bg: 'secondary.50' }}
                      borderRadius='sm'
                    >
                      <Text ml={1} fontSize='xs'>
                        {filter.name}
                      </Text>
                    </Checkbox>
                  ))}
                </Stack>
              ))}
              {filteredGroups.length === 0 && (
                <Text fontSize='sm' color='gray.600' px={3} py={2}>
                  {CUSTOMIZE_FILTERS_COPY.noFiltersFound}
                </Text>
              )}
            </Flex>
          </CheckboxGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
