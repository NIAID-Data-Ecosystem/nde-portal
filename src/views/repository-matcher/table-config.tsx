import React from 'react';
import NextLink from 'next/link';
import {
  Badge,
  Box,
  Circle,
  HStack,
  Icon,
  SkeletonText,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Repository } from 'src/hooks/api/useRepoData';
import {
  AccessTypes,
  DefinedTerm,
  Domain,
  FormattedResource,
} from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-string';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';
import Tooltip from 'src/components/tooltip';
import { TagWithUrl } from 'src/components/tag-with-url';
import { FaCheck, FaX, FaXmark } from 'react-icons/fa6';

export type RepositoryMatcherItem = Repository | FormattedResource;

export type NameValue = { label: string; url: string; _id: string };

export type RepositoryMatcherFilterConfig<TValue = unknown> = {
  /** Display name shown in the filter section header. */
  name: string;
  /** Tooltip description for the section. */
  description?: string;
  /** Optional grouping passed through to FiltersList. */
  groupBy?: { property: string; label: string }[];
  /**
   * Map a row's display value to the discrete filter terms it should
   * contribute. Each returned string becomes a checkbox entry and the row
   * matches the filter when any of its values is selected. Return [] to
   * exclude the row from this filter's terms.
   */
  getFilterValues: (value: TValue) => string[];
};

export type RepositoryMatcherColumn<TValue = unknown> = {
  id: string;
  label: string;
  fields: string[];
  columns?: {
    isSortable?: boolean;
    isDefault?: boolean;
    style?: React.CSSProperties;
  };
  /**
   * When true, the column cannot be hidden by the customize-columns popover.
   * Default: false.
   */
  required?: boolean;
  transform: (item: RepositoryMatcherItem) => TValue;
  component: (props: { value: TValue; isLoading?: boolean }) => React.ReactNode;
  /**
   * Reduce the column's display value to a sortable primitive. Omit for
   * columns whose display value is already a string/number.
   */
  getSortValue?: (value: TValue) => string | number;
  /**
   * Reduce the column's display value to text the search bar can match
   * against. Return a string, an array of strings, or null to opt the column
   * out of search. Omit when the display value is already string/string[].
   */
  getSearchValue?: (value: TValue) => string | string[] | null;
  /**
   * Opts the column into the filter sidebar. Omit to leave the column out of
   * filtering.
   */
  filter?: RepositoryMatcherFilterConfig<TValue>;
};

const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = (item as any).type;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};

const buildItemUrl = (item: RepositoryMatcherItem): string => {
  const id = item._id || '';
  if (!id) return '';
  const types = itemTypes(item);
  if (types.includes('Resource Catalog')) {
    return `/resources?id=${encodeURIComponent(id)}`;
  }
  const filters = queryFilterObject2String({
    'includedInDataCatalog.name': [id],
  });
  const params = new URLSearchParams();
  params.set('q', '');
  if (filters) params.set('filters', filters);
  if (types.includes('Computational Tool Repository')) {
    const tab = getTabIdFromTypeLabel('ComputationalTool');
    if (tab) params.set('tab', tab);
  }
  return `/search?${params.toString()}`;
};

const TextCell = ({
  value,
  isLoading,
  noOfLines,
  children,
  ...props
}: TextProps & {
  value: string;
  isLoading?: boolean;
}) => (
  <SkeletonText
    isLoaded={!isLoading}
    noOfLines={noOfLines}
    spacing='2'
    w='100%'
  >
    <Text
      noOfLines={noOfLines}
      fontStyle={value ? 'normal' : 'italic'}
      lineHeight='shorter'
      {...props}
    >
      {children || value || 'not available'}
    </Text>
  </SkeletonText>
);

const TagCell = ({
  value,
  url,
  noOfLines = 2,
  isLoading,
}: {
  value: string;
  url?: string;
  noOfLines?: number;
  isLoading?: boolean;
}) => {
  const label = value || '';

  return (
    <SkeletonText isLoaded={!isLoading} noOfLines={noOfLines}>
      <Tooltip label={label} isDisabled={!value} hasArrow>
        <Box>
          {url ? (
            <TagWithUrl href={url}>{label}</TagWithUrl>
          ) : (
            <Tag variant='subtle' noOfLines={noOfLines}>
              <TagLabel>{label}</TagLabel>
            </Tag>
          )}
        </Box>
      </Tooltip>
    </SkeletonText>
  );
};
export const REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] = [
  {
    id: 'name',
    label: 'Name',
    fields: ['name', '_id', 'identifier', 'url', '@type', 'collectionType'],
    columns: { isSortable: true, isDefault: true },
    required: true,
    transform: (item): NameValue => ({
      label: item.name || item._id || '',
      url: buildItemUrl(item),
      _id: item._id || '',
    }),
    getSortValue: (value: NameValue) => value.label.toLowerCase(),
    getSearchValue: (value: NameValue) => value.label,
    component: ({
      value,
      isLoading,
    }: {
      value: NameValue;
      isLoading?: boolean;
    }) => (
      <SkeletonText
        isLoaded={!isLoading && Boolean(value?._id)}
        noOfLines={2}
        fontSize='sm'
        w='100%'
      >
        {value?.url ? (
          <NextLink href={value.url} prefetch={false} passHref>
            <Link as='div'>{value.label}</Link>
          </NextLink>
        ) : (
          <Text fontSize='sm'>{value?.label || '-'}</Text>
        )}
      </SkeletonText>
    ),
  },

  {
    id: 'description',
    label: 'Description',
    fields: ['description'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string => item.description || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => <TextCell value={value} isLoading={isLoading} noOfLines={3} />,
  },
  {
    id: 'abstract',
    label: 'Abstract',
    fields: ['abstract'],
    columns: { isSortable: true, isDefault: false },
    transform: (item): string => item.abstract || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => <TextCell value={value} isLoading={isLoading} noOfLines={3} />,
  },
  {
    id: 'type',
    label: 'Type',
    fields: ['@type', 'collectionType', 'type'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string[] => itemTypes(item),
    getSortValue: (value: string[]) => (value[0] || '').toLowerCase(),
    component: ({
      value,
      isLoading,
    }: {
      value: string[];
      isLoading?: boolean;
    }) => (
      <TextCell
        value={value && value.length ? value.join(', ') : ''}
        isLoading={isLoading}
        fontWeight='semibold'
      />
    ),
    filter: {
      name: 'Type',
      description: 'Filter by the kind of repository or catalog',
      getFilterValues: (value: string[]) => value ?? [],
    },
  },
  {
    id: 'researchDomain',
    label: 'Research Domain',
    fields: ['genre'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.genre) return [];
      return Array.isArray(item.genre) ? item.genre : [item.genre];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: string[];
      isLoading?: boolean;
    }) => {
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell key={i} value={v} noOfLines={1} isLoading={isLoading} />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Research Domain',
      description: 'Filter by the research domain of the repository or catalog',
      getFilterValues: (value: string[]) => value ?? [],
    },
  },
  {
    id: 'coa',
    label: 'Conditions of Access',
    fields: ['conditionsOfAccess'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string =>
      transformConditionsOfAccessLabel(
        formatConditionsOfAccess(item.conditionsOfAccess),
      ) || '',
    component: ({ value }: { value: string; isLoading?: boolean }) => {
      const colorScheme = getColorScheme(value as AccessTypes);
      return (
        <Tag
          colorScheme={colorScheme}
          variant='subtle'
          borderColor='transparent'
          borderRadius='full'
          outlineColor='transparent'
          gap={2}
          boxShadow='none'
        >
          <Circle size='8px' bg={`${colorScheme}.500`} />
          <TagLabel>{value || '-'}</TagLabel>
        </Tag>
      );
    },
    filter: {
      name: 'Conditions of Access',
      description: 'Filter by how the repository allows access to its data',
      getFilterValues: (value: string) => (value ? [value] : []),
    },
  },
  {
    id: 'healthCondition',
    label: 'Health Condition',
    fields: ['healthCondition'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.healthCondition) return [];
      return Array.isArray(item.healthCondition)
        ? item.healthCondition
        : [item.healthCondition];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => {
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell
              key={i}
              value={v.name || ''}
              url={v.url || undefined}
              noOfLines={1}
              isLoading={isLoading}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Health Condition',
      description: 'Filter by the health condition studied by the repository',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'infectiousAgent',
    label: 'Pathogen Species',
    fields: ['infectiousAgent'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.infectiousAgent) return [];
      return Array.isArray(item.infectiousAgent)
        ? item.infectiousAgent
        : [item.infectiousAgent];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => {
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell
              key={i}
              value={v.name || ''}
              url={v.url || undefined}
              noOfLines={1}
              isLoading={isLoading}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Pathogen Species',
      description: 'Filter by the pathogen species studied by the repository',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'dataAccepted',
    label: 'Accepting Data?',
    fields: ['creativeWorkStatus'],
    columns: { isSortable: true, isDefault: true },
    transform: item => item.creativeWorkStatus,
    component: ({ value }: { value: string | null; isLoading?: boolean }) => {
      const isAccepting = value?.toLowerCase() === 'accepting data';
      const isNotAccepting = value?.toLowerCase() === 'retired';
      const color = isAccepting ? 'primary.500' : 'gray.800';
      return (
        <HStack gap={1} color={color} opacity={isAccepting || !value ? 1 : 0.8}>
          {isAccepting ? (
            <Icon as={FaCheck}></Icon>
          ) : isNotAccepting ? (
            <Icon as={FaXmark}></Icon>
          ) : null}
          <TextCell
            value={value || ''}
            color={'inherit'}
            fontWeight={!value ? 'normal' : 'medium'}
          />
        </HStack>
      );
    },
    filter: {
      name: 'Accepting Data?',
      description: '',
      getFilterValues: (value: string) => (value ? [value] : []),
    },
  },
  {
    id: 'collectionSize',
    label: 'Collection Size',
    fields: ['collectionSize'],
    columns: {
      isSortable: false,
      isDefault: true,
      style: { maxWidth: '160px', minWidth: '160px' },
    },
    transform: item => item.collectionSize,
    component: ({
      value,
    }: {
      value: Repository['collectionSize'] | FormattedResource['collectionSize'];
    }) => {
      return (
        <VStack>
          {value?.map((v, i) => (
            <TextCell
              key={i}
              value={v.minValue ? `${v.minValue} ${v.unitText || ''}` : ''}
              textAlign='end'
              noOfLines={undefined}
            >
              <Text as='span' fontWeight='semibold' fontSize='inherit'>
                {v.minValue?.toLocaleString() || '-'}
              </Text>
              <br />
              <Text as='span' fontSize='inherit'>
                {v.unitText}
              </Text>
            </TextCell>
          ))}
        </VStack>
      );
    },
  },
  {
    id: 'species',
    label: 'Host Species',
    fields: ['species'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.species) return [];
      return Array.isArray(item.species) ? item.species : [item.species];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => {
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell
              key={i}
              value={v.name || ''}
              url={v.url || undefined}
              noOfLines={1}
              isLoading={isLoading}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Host Species',
      description: 'Filter by the host species studied by the repository',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'meas-technique',
    label: 'Measurement Technique',
    fields: ['measurementTechnique'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.measurementTechnique) return [];
      return Array.isArray(item.measurementTechnique)
        ? item.measurementTechnique
        : [item.measurementTechnique];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => {
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell
              key={i}
              value={v.name || ''}
              url={v.url || undefined}
              noOfLines={1}
              isLoading={isLoading}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Measurement Technique',
      description: 'Filter by the measurement technique used by the repository',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'topic',
    label: 'Topic Categories',
    fields: ['topicCategory'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.topicCategory) return [];
      return Array.isArray(item.topicCategory)
        ? item.topicCategory
        : [item.topicCategory];
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => {
      if (!value || !value?.some(v => v.name)) {
        return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
      }
      return (
        <HStack flexWrap='wrap'>
          {value?.map((v, i) => (
            <TagCell
              key={i}
              value={v.name || ''}
              url={v.url || undefined}
              noOfLines={1}
              isLoading={isLoading}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      name: 'Topic Categories',
      description: 'Filter by the topic categories studied by the repository',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
];

export const FILTERABLE_REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] =
  REPOSITORY_MATCHER_COLUMNS.filter(c => Boolean(c.filter));
