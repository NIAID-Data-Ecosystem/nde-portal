import React from 'react';
import { Circle, HStack, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';
import { AccessTypes, DefinedTerm } from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import {
  getMetadataDescription,
  getMetadataName,
} from 'src/components/metadata';
import {
  TagCellList,
  TagCell,
  TextCell,
  TextCellWithLink,
} from './components/TableCells';
import { itemTypes } from './utils';
import {
  NameValue,
  RepositoryMatcherColumn,
  RepositoryMatcherItem,
} from './types';

const tagCellStyles = {
  bg: 'page.alt',
  color: 'text.body',
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
      url: item?.url || '',
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
      <TextCellWithLink
        label={value?.label || ''}
        url={`/sources#${value?._id || ''}`}
        isLoading={isLoading}
        isExternal={false}
      />
    ),
    info: {
      filterDescription: getMetadataDescription('name') || '',
    },
  },
  {
    id: 'description',
    label: getMetadataName('description') || '',
    fields: ['description'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: 'unset', minWidth: '450px' },
    },
    transform: (item): RepositoryMatcherItem['description'] =>
      item.description || '',
    component: ({
      value,
      isLoading,
    }: {
      value: RepositoryMatcherItem['description'];
      isLoading?: boolean;
    }) => {
      return (
        <TextCell
          value={value || ''}
          isLoading={isLoading}
          noOfLines={8}
          expandable
        />
      );
    },
  },
  // {
  //   id: 'abstract',
  //   label: getMetadataName('abstract') || '',
  //   fields: ['abstract'],
  //   columns: { isSortable: true, isDefault: false },
  //   transform: (item): RepositoryMatcherItem['abstract'] => item.abstract || '',
  //   component: ({
  //     value,
  //     isLoading,
  //   }: {
  //     value: RepositoryMatcherItem['abstract'];
  //     isLoading?: boolean;
  //   }) => <TextCell value={value || ''} isLoading={isLoading} noOfLines={3} />,
  // },
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
            <TagCell
              key={i}
              value={v}
              noOfLines={1}
              isLoading={isLoading}
              {...tagCellStyles}
            />
          ))}
        </HStack>
      );
    },
    filter: {
      getFilterValues: (value: string[]) => value ?? [],
    },
    info: {
      description: 'Categorical information about the content of a resource.',
      filterDescription: getMetadataDescription('genre') || '',
      tooltip: getMetadataDescription('genre') || '',
      terms: [
        {
          label: 'Generalist',
          description:
            'A resource not specifically designed for Infectious and/or Immune-Mediated Disease content',
        },
        {
          label: 'IID',
          description:
            'A resource specifically designed for Infectious and/or Immune-Mediated Disease content',
        },
      ],
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
      getFilterValues: (value: string) => (value ? [value] : []),
    },
    info: {
      description:
        'Access-level definitions options include open (freely available), controlled (may include restrictions such as on use), or registered (requires registration to access).',
      filterDescription: getMetadataDescription('conditionsOfAccess') || '',
      tooltip: getMetadataDescription('conditionsOfAccess') || '',
      terms: [
        {
          label: 'Controlled Access',
          description:
            'The repository may include restrictions such as for access or use',
        },
        {
          label: 'Open Access',
          description: 'The data in the repository is freely available',
        },
        {
          label: 'Registered Access',
          description: 'The repository requires registration to access',
        },
        {
          label: 'Varied Access',
          description:
            'The repository contains data that varies at the record level',
        },
      ],
    },
  },
  {
    id: 'healthCondition',
    label: getMetadataName('healthCondition') || '',
    fields: ['healthCondition'],
    columns: { isSortable: false, isDefault: true },
    transform: item => {
      if (!item.healthCondition) return [];
      return Array.isArray(item.healthCondition)
        ? item.healthCondition
        : [item.healthCondition];
    },
    getSearchValue: (value: DefinedTerm[]) => {
      return (
        value?.map(v => v.name).filter((name): name is string => !!name) ?? []
      );
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => (
      <TagCellList value={value} isLoading={isLoading} {...tagCellStyles} />
    ),
    filter: {
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
    info: {
      description: getMetadataDescription('healthCondition') || '',
      filterDescription: getMetadataDescription('healthCondition') || '',
      tooltip: getMetadataDescription('healthCondition') || '',
    },
  },
  {
    id: 'infectiousAgent',
    label: getMetadataName('infectiousAgent') || '',
    fields: ['infectiousAgent'],
    columns: { isSortable: false, isDefault: true },
    transform: item => {
      if (!item.infectiousAgent) return [];
      return Array.isArray(item.infectiousAgent)
        ? item.infectiousAgent
        : [item.infectiousAgent];
    },
    getSearchValue: (value: DefinedTerm[]) => {
      return (
        value?.map(v => v.name).filter((name): name is string => !!name) ?? []
      );
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => (
      <TagCellList value={value} isLoading={isLoading} {...tagCellStyles} />
    ),
    filter: {
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
    info: {
      description: getMetadataDescription('infectiousAgent') || '',
      filterDescription: getMetadataDescription('infectiousAgent') || '',
      tooltip: getMetadataDescription('infectiousAgent') || '',
    },
  },
  // {
  //   id: 'dataAccepted',
  //   label: 'Accepting Data?',
  //   fields: ['creativeWorkStatus'],
  //   columns: {
  //     isSortable: true,
  //     isDefault: true,
  //     style: { maxWidth: '180px', minWidth: '180px' },
  //   },
  //   transform: item => item.creativeWorkStatus,
  //   component: ({
  //     value,
  //   }: {
  //     value: CreativeWorkStatusDatasetType | null;
  //     isLoading?: boolean;
  //   }) => {
  //     const isNotAccepting = [
  //       'retired',
  //       'maintenance',
  //       'not accepting data',
  //     ].includes(value?.toLowerCase() || '');
  //     const color = isNotAccepting || !value ? 'gray.800' : 'primary.500';

  //     return (
  //       <HStack gap={1} color={color} opacity={isNotAccepting ? 0.8 : 1}>
  //         {isNotAccepting ? (
  //           <Icon as={FaXmark}></Icon>
  //         ) : value ? (
  //           <Icon as={FaCheck}></Icon>
  //         ) : null}
  //         <TextCell
  //           value={value || ''}
  //           color={'inherit'}
  //           fontWeight={!value ? 'normal' : 'medium'}
  //         />
  //       </HStack>
  //     );
  //   },
  //   filter: {
  //     name: 'Accepting Data?',
  //     description: getMetadataDescription('creativeWorkStatus') || '',
  //     getFilterValues: (value: string) => (value ? [value] : []),
  //   },
  // },
  // {
  //   id: 'collectionSize',
  //   label: getMetadataName('collectionSize') || '',
  //   fields: ['collectionSize'],
  //   columns: {
  //     isSortable: false,
  //     isDefault: true,
  //     style: { maxWidth: '160px', minWidth: '160px' },
  //   },
  //   transform: item => item.collectionSize,
  //   getSearchValue: (value: RepositoryMatcherItem['collectionSize']) => {
  //     return value?.map(v => `${v.minValue} ${v.unitText || ''}`) || [];
  //   },
  //   component: ({
  //     value,
  //   }: {
  //     value: RepositoryMatcherItem['collectionSize'];
  //     isLoading?: boolean;
  //   }) => {
  //     return (
  //       <VStack>
  //         {value?.map((v, i) => (
  //           <TextCell
  //             key={i}
  //             value={v.minValue ? `${v.minValue} ${v.unitText || ''}` : ''}
  //             textAlign='end'
  //             noOfLines={undefined}
  //           >
  //             <Text as='span' fontWeight='semibold' fontSize='inherit'>
  //               {v.minValue?.toLocaleString() || '-'}
  //             </Text>
  //             <br />
  //             <Text as='span' fontSize='inherit'>
  //               {v.unitText}
  //             </Text>
  //           </TextCell>
  //         ))}
  //       </VStack>
  //     );
  //   },
  // },
  {
    id: 'species',
    label: 'Host Species',
    fields: ['species'],
    columns: { isSortable: false, isDefault: true },
    transform: item => {
      if (!item.species) return [];
      return Array.isArray(item.species) ? item.species : [item.species];
    },
    getSearchValue: (value: DefinedTerm[]) => {
      return (
        value?.map(v => v.name).filter((name): name is string => !!name) ?? []
      );
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => (
      <TagCellList value={value} isLoading={isLoading} {...tagCellStyles} />
    ),
    filter: {
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
    info: {
      description: getMetadataDescription('species') || '',
      filterDescription: getMetadataDescription('species') || '',
      tooltip: getMetadataDescription('species') || '',
    },
  },
  {
    id: 'meas-technique',
    label: getMetadataName('measurementTechnique') || '',
    fields: ['measurementTechnique'],
    columns: { isSortable: false, isDefault: true },
    transform: item => {
      if (!item.measurementTechnique) return [];
      return Array.isArray(item.measurementTechnique)
        ? item.measurementTechnique
        : [item.measurementTechnique];
    },
    getSearchValue: (value: DefinedTerm[]) => {
      return (
        value?.map(v => v.name).filter((name): name is string => !!name) ?? []
      );
    },
    component: ({
      value,
      isLoading,
    }: {
      value: DefinedTerm[];
      isLoading?: boolean;
    }) => (
      <TagCellList value={value} isLoading={isLoading} {...tagCellStyles} />
    ),
    filter: {
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
    info: {
      description: getMetadataDescription('measurementTechnique') || '',
      filterDescription: getMetadataDescription('measurementTechnique') || '',
      tooltip: getMetadataDescription('measurementTechnique') || '',
    },
  },
  {
    id: 'topic',
    label: getMetadataName('topicCategory') || '',
    fields: ['topicCategory'],
    columns: { isSortable: false, isDefault: true },
    transform: item => {
      if (!item.topicCategory) return [];
      return Array.isArray(item.topicCategory)
        ? item.topicCategory
        : [item.topicCategory];
    },
    getSearchValue: (value: DefinedTerm[]) => {
      return (
        value?.map(v => v.name).filter((name): name is string => !!name) ?? []
      );
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
      return (
        <TagCellList value={value} isLoading={isLoading} {...tagCellStyles} />
      );
    },
    filter: {
      getFilterValues: (value: DefinedTerm[]) =>
        value?.map(v => v.name).filter((name): name is string => !!name) ?? [],
    },
    info: {
      description: getMetadataDescription('topicCategory') || '',
      filterDescription: getMetadataDescription('topicCategory') || '',
      tooltip: getMetadataDescription('topicCategory') || '',
    },
  },
  // {
  //   id: 'dateModified',
  //   label: getMetadataName('dateModified') || '',
  //   fields: ['dateModified'],
  //   columns: { isSortable: true, isDefault: true },
  //   transform: item => {
  //     if (!item.dateModified) return '';
  //     return new Date(item.dateModified).toLocaleDateString();
  //   },
  //   component: ({
  //     value,
  //     isLoading,
  //   }: {
  //     value: string;
  //     isLoading?: boolean;
  //   }) => {
  //     return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
  //   },
  // },
  {
    id: 'temporalCoverage',
    label: getMetadataName('temporalCoverage') || '',
    fields: ['temporalCoverage'],
    columns: { isSortable: true, isDefault: true },
    transform: item => {
      return item.temporalCoverage;
    },
    getSearchValue: (value: RepositoryMatcherItem['temporalCoverage']) => {
      return (
        value?.map(v => {
          if (!v.startDate && !v.endDate && v.name) return v.name;
          return `${v.startDate},${v.endDate}`;
        }) ?? []
      );
    },
    component: ({
      value,
      isLoading,
    }: {
      value?: RepositoryMatcherItem['temporalCoverage'];
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
        if (!tc.startDate && !tc.endDate && tc.name) {
          return (
            <Text key={tc.name} as='span' fontSize='xs'>
              {tc.name}
            </Text>
          );
        }
        const start = tc.startDate
          ? new Date(tc.startDate).toLocaleDateString()
          : '-';
        const end = tc.endDate
          ? new Date(tc.endDate).toLocaleDateString()
          : '-';
        return (
          <VStack
            key={`${tc.startDate}-${tc.endDate}`}
            alignItems='flex-start'
            fontSize='xs'
          >
            <Text as='span' fontSize='inherit'>
              {start}
            </Text>
            <Text as='span' fontSize='inherit'>
              to
            </Text>
            <Text as='span' fontSize='inherit'>
              {end}
            </Text>
          </VStack>
        );
      });

      return formatted;
    },
    info: {
      description: getMetadataDescription('temporalCoverage') || '',
      tooltip: getMetadataDescription('temporalCoverage') || '',
    },
  },
  {
    id: 'license',
    label: getMetadataName('license') || '',
    fields: ['license'],
    columns: { isSortable: true, isDefault: true },
    transform: item => item.license || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => {
      if (value && (value.startsWith('http') || value.startsWith('www'))) {
        return (
          <TextCellWithLink
            label={value}
            url={value}
            isLoading={isLoading}
            isExternal
          />
        );
      }
      return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
    },
    info: {
      description: getMetadataDescription('license') || '',
      tooltip: getMetadataDescription('license') || '',
    },
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
      getFilterValues: (value: string[]) => value ?? [],
    },
    info: {
      description:
        'Type is a Portal-specific classification that indicates how repository content is organized and displayed within the Portal.',
      filterDescription: getMetadataDescription('type') || '',
      tooltip: getMetadataDescription('type') || '',
      terms: [
        {
          label: 'Dataset Repository',
          description:
            'A repository which holds Dataset records. Dataset metadata records are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Resource Catalog',
          description:
            ' A manually curated record about the repository/resource/portal etc. itself. Repositories displayed only as Resource Catalogs in the Discovery Portal are not sources of record ingest at this time.',
        },
        {
          label: 'Computational Tool Repository',
          description:
            'A repository which holds Computational Tool records. Tool metadata records are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Sample Repository',
          description:
            'A repository which holds biological specimen or sample records. Metadata records about samples are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Data Repository',
          description:
            'A repository which holds other types of records. Records of a searchable type are aggregated from the original source and used to create Data Collection records in the Discovery Portal. Multiple records submitted to a Data Repository may end up as a single Data Collection record in the Discovery Portal.',
        },
      ],
    },
  },
  // {
  //   id: 'usageInfo',
  //   label: getMetadataName('usageInfo') || '',
  //   fields: ['usageInfo'],
  //   columns: { isSortable: true, isDefault: true },
  //   transform: item => item.usageInfo || '',
  //   getSearchValue: (value: RepositoryMatcherItem['usageInfo']) => {
  //     if (typeof value === 'string') {
  //       return value;
  //     }
  //     if (Array.isArray(value)) {
  //       return value
  //         .map(v => (typeof v === 'string' ? v : v.name || v.url || ''))
  //         .filter(v => v);
  //     }
  //     if (value && typeof value === 'object') {
  //       return value.name || value.url || '';
  //     }
  //     return null;
  //   },
  //   component: ({
  //     value,
  //     isLoading,
  //   }: {
  //     value: Repository['usageInfo'] | FormattedResource['usageInfo'];
  //     isLoading?: boolean;
  //   }) => {
  //     if (typeof value === 'string') {
  //       if (value.startsWith('http') || value.startsWith('www')) {
  //         return (
  //           <TextCellWithLink
  //             label={value}
  //             url={value}
  //             isLoading={isLoading}
  //             isExternal
  //           />
  //         );
  //       }
  //       return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
  //     }

  //     const usageDetails = Array.isArray(value) ? value : value ? [value] : [];

  //     if (!isLoading && usageDetails.length === 0) {
  //       return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
  //     } else if (usageDetails.length > 0) {
  //       return (
  //         <VStack alignItems='flex-start'>
  //           {usageDetails.map((u, i) => (
  //             <Box key={i}>
  //               {u.url ? (
  //                 <TextCellWithLink
  //                   label={u.name || u.url}
  //                   url={u.url}
  //                   isLoading={isLoading}
  //                   isExternal
  //                 />
  //               ) : (
  //                 <TextCell value={u.name || ''} isLoading={isLoading} />
  //               )}
  //               <br />
  //               {u?.description && (
  //                 <TextCell
  //                   value={u.description}
  //                   isLoading={isLoading}
  //                   noOfLines={3}
  //                 />
  //               )}
  //             </Box>
  //           ))}
  //         </VStack>
  //       );
  //     }
  //     return <TextCell value={''} isLoading={isLoading} noOfLines={1} />;
  //   },
  // },
];

export const FILTERABLE_REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] =
  REPOSITORY_MATCHER_COLUMNS.filter(c => Boolean(c.filter));
