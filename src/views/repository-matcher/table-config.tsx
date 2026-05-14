import React from 'react';
import NextLink from 'next/link';
import {
  Box,
  Circle,
  HStack,
  Icon,
  SkeletonText,
  Tag,
  TagLabel,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Repository } from 'src/hooks/api/useRepoData';
import {
  AccessTypes,
  DefinedTerm,
  FormattedResource,
  TemporalCoverage,
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
import { FaCheck, FaXmark } from 'react-icons/fa6';
import {
  getMetadataDescription,
  getMetadataName,
} from 'src/components/metadata';
import { CreativeWorkStatusDatasetType } from 'src/hooks/api/types';
import { Skeleton } from 'src/components/skeleton';

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

const DefinedTermTagList = ({
  value,
  isLoading,
}: {
  value?: DefinedTerm[];
  isLoading?: boolean;
}) => {
  const items: (DefinedTerm | null)[] = isLoading
    ? Array.from({ length: 3 }, () => null)
    : value ?? [];

  if (!isLoading && items.length === 0) {
    return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
  }
  return (
    <HStack flexWrap='wrap'>
      {items.map((v, i) => (
        <TagCell
          key={i}
          value={v?.name || ''}
          url={v?.url || undefined}
          noOfLines={1}
          isLoading={isLoading}
        />
      ))}
    </HStack>
  );
};

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
  if (isLoading) {
    return <Skeleton isLoaded={false} width='80px' height='20px' />;
  }
  const label = value || '';
  return (
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
  );
};
export const REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] = [
  {
    id: 'name',
    label: getMetadataName('name') || '',
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
    label: getMetadataName('description') || '',
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
    label: getMetadataName('abstract') || '',
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
    label: getMetadataName('type') || '',
    fields: ['@type', 'collectionType', 'type'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '180px', minWidth: '180px' },
    },
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
      name: getMetadataName('type') || '',
      description: getMetadataDescription('type') || '',
      getFilterValues: (value: string[]) => value ?? [],
    },
  },
  {
    id: 'researchDomain',
    label: getMetadataName('genre') || '',
    fields: ['genre'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '225px', minWidth: '225px' },
    },
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
      const items = isLoading
        ? Array.from({ length: 3 }, () => '')
        : value ?? [];

      if (!isLoading && items.length === 0) {
        return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
      }
      return (
        <HStack flexWrap='wrap'>
          {items.map((v, i) => (
            <TagCell key={i} value={v} noOfLines={1} isLoading={isLoading} />
          ))}
        </HStack>
      );
    },
    filter: {
      name: getMetadataName('genre') || '',
      description: getMetadataDescription('genre') || '',
      getFilterValues: (value: string[]) => value ?? [],
    },
  },
  {
    id: 'coa',
    label: 'Access',
    fields: ['conditionsOfAccess'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '200px', minWidth: '200px' },
    },
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
      name: 'Access',
      description: getMetadataDescription('conditionsOfAccess') || '',
      getFilterValues: (value: string) => (value ? [value] : []),
    },
  },
  {
    id: 'healthCondition',
    label: getMetadataName('healthCondition') || '',
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
    }) => <DefinedTermTagList value={value} isLoading={isLoading} />,
    filter: {
      name: getMetadataName('healthCondition') || '',
      description: getMetadataDescription('healthCondition') || '',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'infectiousAgent',
    label: getMetadataName('infectiousAgent') || '',
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
    }) => <DefinedTermTagList value={value} isLoading={isLoading} />,
    filter: {
      name: 'Pathogen Species',
      description: getMetadataDescription('infectiousAgent') || '',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'dataAccepted',
    label: 'Accepting Data?',
    fields: ['creativeWorkStatus'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '180px', minWidth: '180px' },
    },
    transform: item => item.creativeWorkStatus,
    component: ({
      value,
    }: {
      value: CreativeWorkStatusDatasetType | null;
      isLoading?: boolean;
    }) => {
      const isNotAccepting = [
        'retired',
        'maintenance',
        'not accepting data',
      ].includes(value?.toLowerCase() || '');
      const color = isNotAccepting || !value ? 'gray.800' : 'primary.500';

      return (
        <HStack gap={1} color={color} opacity={isNotAccepting ? 0.8 : 1}>
          {isNotAccepting ? (
            <Icon as={FaXmark}></Icon>
          ) : value ? (
            <Icon as={FaCheck}></Icon>
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
      description: getMetadataDescription('creativeWorkStatus') || '',
      getFilterValues: (value: string) => (value ? [value] : []),
    },
  },
  {
    id: 'collectionSize',
    label: getMetadataName('collectionSize') || '',
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
    label: getMetadataName('species') || '',
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
    }) => <DefinedTermTagList value={value} isLoading={isLoading} />,
    filter: {
      name: getMetadataName('species') || '',
      description: getMetadataDescription('species') || '',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'meas-technique',
    label: getMetadataName('measurementTechnique') || '',
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
    }) => <DefinedTermTagList value={value} isLoading={isLoading} />,
    filter: {
      name: getMetadataName('measurementTechnique') || '',
      description: getMetadataDescription('measurementTechnique') || '',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'topic',
    label: getMetadataName('topicCategory') || '',
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
      if (!isLoading && (!value || !value.some(v => v.name))) {
        return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
      }
      return <DefinedTermTagList value={value} isLoading={isLoading} />;
    },
    filter: {
      name: getMetadataName('topicCategory') || '',
      description: getMetadataDescription('topicCategory') || '',
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
  },
  {
    id: 'dateModified',
    label: getMetadataName('dateModified') || '',
    fields: ['dateModified'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      if (!item.dateModified) return '';
      return new Date(item.dateModified).toLocaleDateString();
    },
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => {
      return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
    },
  },
  {
    id: 'temporalCoverage',
    label: getMetadataName('temporalCoverage') || '',
    fields: ['temporalCoverage'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      return item.temporalCoverage;
    },
    component: ({
      value,
      isLoading,
    }: {
      value?: TemporalCoverage[] | null | undefined;
      isLoading?: boolean;
    }) => {
      if (isLoading) {
        return <TextCell value={''} isLoading={true} noOfLines={1} />;
      }
      // Format temporal coverage as "startDate - endDate" or just "startDate" if endDate is missing or just endDate if startDate is missing. If multiple temporal coverages are present, separate them with commas.
      if (!value || value.length === 0) {
        return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
      }
      const formatted = value.map(tc => {
        const start = tc.startDate
          ? new Date(tc.startDate).toLocaleDateString()
          : '-';
        const end = tc.endDate
          ? new Date(tc.endDate).toLocaleDateString()
          : '-';
        return (
          <VStack key={`${tc.startDate}-${tc.endDate}`} alignItems='flex-start'>
            <Text as='span'>{start}</Text>
            <Text as='span'>to</Text>
            <Text as='span'>{end}</Text>
          </VStack>
        );
      });

      return formatted;
    },
  },
];

export const FILTERABLE_REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] =
  REPOSITORY_MATCHER_COLUMNS.filter(c => Boolean(c.filter));
