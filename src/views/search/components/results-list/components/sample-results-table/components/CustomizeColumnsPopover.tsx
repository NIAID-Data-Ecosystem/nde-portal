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
import { FaSliders } from 'react-icons/fa6';

export const CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY =
  'search-visible-sample-columns';

export const DEFAULT_VISIBLE_COLUMN_IDS = [
  'identifier',
  'name',
  'date',
  'includedInDataCatalog',
  'description',
  'conditionsOfAccess',
  'sex',
  'species',
];

export interface ColumnConfig {
  id: string;
  title: string;
}

const COPY = {
  button: 'Customize Columns',
  header: 'Customize Columns',
  description: 'Select which columns to display.',
  searchPlaceholder: 'Search columns',
  noColumnsFound: 'No columns found',
  selectAll: 'Select All',
  clearAll: 'Clear All',
};

interface CustomizeColumnsPopoverProps {
  columnsList: ColumnConfig[];
  onVisibleColumnsChange?: (visibleColumnIds: string[]) => void;
}

const REQUIRED_COLUMN_IDS = ['identifier', 'name'];

export const CustomizeColumnsPopover = ({
  columnsList,
  onVisibleColumnsChange,
}: CustomizeColumnsPopoverProps) => {
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const allColumnIds = useMemo(
    () => columnsList.map(col => col.id),
    [columnsList],
  );

  // Columns filtered by search term
  const filteredColumns = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return columnsList;
    return columnsList.filter(col =>
      col.title.toLowerCase().includes(normalized),
    );
  }, [columnsList, searchTerm]);

  // Load persisted selection from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedValue = window.localStorage.getItem(
      CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    );

    if (!storedValue) {
      // First visit: use the default subset
      const validDefaults = DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
        allColumnIds.includes(id),
      );
      setVisibleColumnIds(validDefaults);
      setIsReady(true);
      return;
    }

    try {
      const parsed = JSON.parse(storedValue);
      if (!Array.isArray(parsed)) {
        const validDefaults = DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
          allColumnIds.includes(id),
        );
        setVisibleColumnIds(validDefaults);
        setIsReady(true);
        return;
      }

      // Keep only ids that still exist in the column list
      const validIds = parsed.filter((id: unknown): id is string =>
        allColumnIds.includes(id as string),
      );
      setVisibleColumnIds(validIds);
      setIsReady(true);
    } catch {
      const validDefaults = DEFAULT_VISIBLE_COLUMN_IDS.filter(id =>
        allColumnIds.includes(id),
      );
      setVisibleColumnIds(validDefaults);
      setIsReady(true);
    }
  }, [allColumnIds]);

  // Notify parent whenever the selection changes (after initial load)
  useEffect(() => {
    if (!isReady) return;
    onVisibleColumnsChange?.(visibleColumnIds);
  }, [visibleColumnIds, onVisibleColumnsChange, isReady]);

  const handleChange = (values: string[]) => {
    // Always keep required columns selected
    const withRequired = [
      ...REQUIRED_COLUMN_IDS.filter(id => allColumnIds.includes(id)),
      ...values.filter(id => !REQUIRED_COLUMN_IDS.includes(id)),
    ];
    setVisibleColumnIds(withRequired);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
        JSON.stringify(withRequired),
      );
    }
  };

  const selectedCount = visibleColumnIds.length;
  const totalCount = allColumnIds.length;

  return (
    <Popover placement='bottom-end'>
      <PopoverTrigger>
        <Button
          colorScheme='primary'
          variant='outline'
          size='sm'
          leftIcon={<Icon as={FaSliders} boxSize={3.5} />}
        >
          {COPY.button} ({selectedCount}/{totalCount})
        </Button>
      </PopoverTrigger>

      <PopoverContent minW='260px'>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader fontWeight='semibold'>
          <Text>{COPY.header}</Text>
          <Text fontSize='sm' fontWeight='normal'>
            {COPY.description}
          </Text>
          <Flex justifyContent='flex-end' flex={1} mt={1}>
            <Button
              size='xs'
              variant='link'
              colorScheme='black'
              onClick={() =>
                handleChange(selectedCount === totalCount ? [] : allColumnIds)
              }
            >
              {selectedCount === totalCount
                ? COPY.clearAll
                : `${COPY.selectAll} (${totalCount})`}
            </Button>
          </Flex>
        </PopoverHeader>

        <PopoverBody p={0} py={1}>
          <Flex px={2} py={1}>
            <Input
              size='sm'
              placeholder={COPY.searchPlaceholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Flex>
          <CheckboxGroup
            size='md'
            value={visibleColumnIds}
            onChange={values => handleChange(values as string[])}
          >
            <Stack gap={0.5} px={2} py={1} maxHeight='16rem' overflowY='auto'>
              {filteredColumns.map(col => (
                <Checkbox
                  key={col.id}
                  value={col.id}
                  px={2}
                  isDisabled={REQUIRED_COLUMN_IDS.includes(col.id)}
                  _hover={{ bg: 'secondary.50' }}
                  borderRadius='sm'
                >
                  <Text ml={1} fontSize='xs'>
                    {col.title}
                  </Text>
                </Checkbox>
              ))}
              {filteredColumns.length === 0 && (
                <Text fontSize='sm' color='gray.600' px={1} py={2}>
                  {COPY.noColumnsFound}
                </Text>
              )}
            </Stack>
          </CheckboxGroup>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
